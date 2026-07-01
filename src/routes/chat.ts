import { Router } from 'express';
import { streamText, generateText } from 'ai';
import type { CoreMessage } from 'ai';
import { getModelTier } from '../lib/provider.js';
import type { ModelTier } from '../lib/provider.js';
import { buildTools } from '../tools/index.js';
import { getContextWindow, addMessage } from '../lib/memory.js';
const router = Router();
const SYS = `You are an AI intelligence assistant. Be precise, helpful, and actionable. Today: ${new Date().toISOString().split('T')[0]}.`;
router.post('/', async (req, res) => {
  const { messages, session_id, tier='standard', provider, tools: rt, system, stream=true, max_steps=5 } = req.body as { messages:CoreMessage[]; session_id?:string; tier?:keyof ModelTier; provider?:string; tools?:string[]; system?:string; stream?:boolean; max_steps?:number; };
  if (!Array.isArray(messages)||!messages.length) return res.status(400).json({error:'messages required'});
  try {
    let all: CoreMessage[] = messages;
    if (session_id) { const h=await getContextWindow(session_id,40); all=[...h.map(m=>({role:m.role as CoreMessage['role'],content:m.content} as CoreMessage)),...messages]; }
    const mdls=getModelTier(provider); const model=(mdls[tier as keyof ModelTier])??mdls.standard;
    const tools=buildTools(rt) as Parameters<typeof streamText>[0]['tools'];
    const sys=system??SYS;
    if (stream) {
      res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','X-Accel-Buffering':'no'});
      const result=streamText({model,system:sys,messages:all,tools,maxSteps:max_steps});
      let txt=''; let u={promptTokens:0,completionTokens:0};
      for await (const c of result.fullStream) {
        if (c.type==='text-delta'){txt+=c.textDelta;res.write(`data: ${JSON.stringify({type:'text',delta:c.textDelta})}\n\n`);}
        else if (c.type==='tool-call') res.write(`data: ${JSON.stringify({type:'tool_call',name:c.toolName})}\n\n`);
        else if ((c as {type:string}).type==='tool-result') { const tc=c as unknown as {toolName:string}; res.write(`data: ${JSON.stringify({type:'tool_result',name:tc.toolName})}\n\n`); }
        else if (c.type==='finish') u=(c as {usage:typeof u}).usage??u;
      }
      if (session_id&&txt) { const lu=[...messages].reverse().find(m=>m.role==='user'); if (lu) await addMessage({session_id,role:'user',content:typeof lu.content==='string'?lu.content:JSON.stringify(lu.content)}).catch(()=>{}); await addMessage({session_id,role:'assistant',content:txt,tokens_used:u.promptTokens+u.completionTokens}).catch(()=>{}); }
      res.write(`data: ${JSON.stringify({type:'done',usage:u})}\n\n`); res.end();
    } else {
      const result=await generateText({model,system:sys,messages:all,tools,maxSteps:max_steps});
      if (session_id&&result.text) { const lu=[...messages].reverse().find(m=>m.role==='user'); if (lu) await addMessage({session_id,role:'user',content:typeof lu.content==='string'?lu.content:JSON.stringify(lu.content)}).catch(()=>{}); await addMessage({session_id,role:'assistant',content:result.text,tokens_used:result.usage.promptTokens+result.usage.completionTokens}).catch(()=>{}); }
      res.json({text:result.text,usage:result.usage,finish_reason:result.finishReason,tool_results:result.toolResults});
    }
  } catch(e) { console.error('[chat]',(e as Error).message); if (!res.headersSent) res.status(500).json({error:(e as Error).message}); else { res.write(`data: ${JSON.stringify({type:'error',error:(e as Error).message})}\n\n`); res.end(); } }
});
export default router;
