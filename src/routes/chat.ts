import { Router } from 'express';
import { streamText, generateText } from 'ai';
import type { CoreMessage } from 'ai';
import { getModelTier } from '../lib/provider.js';
import { buildTools } from '../tools/index.js';
import { getContextWindow, addMessage } from '../lib/memory.js';

const router = Router();

const DEFAULT_SYSTEM =
  `You are an AI intelligence assistant. ` +
  `Be precise, helpful, and actionable. Today: ${new Date().toISOString().split('T')[0]}.`;

router.post('/', async (req, res) => {
  const { messages, session_id, tier='standard', provider, tools: requestedTools,
          system, stream=true, max_steps=5 } =
    req.body as {
      messages: CoreMessage[]; session_id?: string;
      tier?: 'fast'|'standard'|'advanced'; provider?: string;
      tools?: string[]; system?: string; stream?: boolean; max_steps?: number;
    };

  if (!Array.isArray(messages)||!messages.length)
    return res.status(400).json({error:'messages array required'});

  try {
    let allMessages: CoreMessage[] = messages;
    if (session_id) {
      const history = await getContextWindow(session_id,40);
      allMessages = [...history.map(m=>({role:m.role as CoreMessage['role'],content:m.content})),...messages];
    }

    const models = getModelTier(provider);
    const model  = ((models as Record<string,unknown>)[tier] as typeof models.standard) ?? models.standard;
    const tools  = buildTools(requestedTools) as Parameters<typeof streamText>[0]['tools'];
    const systemPrompt = system ?? DEFAULT_SYSTEM;

    if (stream) {
      res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','X-Accel-Buffering':'no'});
      const result = streamText({model,system:systemPrompt,messages:allMessages,tools,maxSteps:max_steps});
      let fullText=''; let usage={promptTokens:0,completionTokens:0};
      for await (const chunk of result.fullStream) {
        if (chunk.type==='text-delta') { fullText+=chunk.textDelta; res.write(`data: ${JSON.stringify({type:'text',delta:chunk.textDelta})}\n\n`); }
        else if (chunk.type==='tool-call') res.write(`data: ${JSON.stringify({type:'tool_call',name:chunk.toolName})}\n\n`);
        else if (chunk.type==='tool-result') res.write(`data: ${JSON.stringify({type:'tool_result',name:chunk.toolName})}\n\n`);
        else if (chunk.type==='finish') usage=(chunk as {usage:typeof usage}).usage??usage;
      }
      if (session_id&&fullText) {
        const lastUser=[...messages].reverse().find(m=>m.role==='user');
        if (lastUser) await addMessage({session_id,role:'user',content:typeof lastUser.content==='string'?lastUser.content:JSON.stringify(lastUser.content)}).catch(()=>{});
        await addMessage({session_id,role:'assistant',content:fullText,tokens_used:usage.promptTokens+usage.completionTokens}).catch(()=>{});
      }
      res.write(`data: ${JSON.stringify({type:'done',usage})}\n\n`);
      res.end();
    } else {
      const result=await generateText({model,system:systemPrompt,messages:allMessages,tools,maxSteps:max_steps});
      if (session_id&&result.text) {
        const lastUser=[...messages].reverse().find(m=>m.role==='user');
        if (lastUser) await addMessage({session_id,role:'user',content:typeof lastUser.content==='string'?lastUser.content:JSON.stringify(lastUser.content)}).catch(()=>{});
        await addMessage({session_id,role:'assistant',content:result.text,tokens_used:result.usage.promptTokens+result.usage.completionTokens}).catch(()=>{});
      }
      res.json({text:result.text,usage:result.usage,finish_reason:result.finishReason,tool_results:result.toolResults});
    }
  } catch (err) {
    console.error('[chat]',(err as Error).message);
    if (!res.headersSent) res.status(500).json({error:(err as Error).message});
    else { res.write(`data: ${JSON.stringify({type:'error',error:(err as Error).message})}\n\n`); res.end(); }
  }
});

export default router;
