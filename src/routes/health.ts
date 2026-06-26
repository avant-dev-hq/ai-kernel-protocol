import { Router } from 'express';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { mistral }   from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { getPool } from '../db/pool.js';
import { getProviderName, getEmbeddingProviderName } from '../lib/provider.js';
import { getToolNames } from '../tools/index.js';
const router = Router();
router.get('/', async (_req, res) => {
  try { await getPool().query('SELECT 1'); res.json({ status:'ok', server:'ai-kernel-protocol', version:'0.1.0', provider:getProviderName(), embedding_provider:getEmbeddingProviderName(), tools:getToolNames().length, ts:new Date().toISOString() }); }
  catch(e) { res.status(503).json({ status:'error', message:(e as Error).message }); }
});
type PR = {status:'ok';latency_ms:number;model:string}|{status:'unconfigured'}|{status:'error';message:string};
router.get('/providers', async (_req, res) => {
  const r: Record<string,PR> = {};
  await Promise.all([
    async()=>{ if (!process.env.ANTHROPIC_API_KEY){r['anthropic']={status:'unconfigured'};return;} const m=process.env.ANTHROPIC_MODEL_FAST??'claude-haiku-4-5';const t=Date.now();try{await generateText({model:anthropic(m),prompt:'hi',maxTokens:1});r['anthropic']={status:'ok',latency_ms:Date.now()-t,model:m};}catch(e){r['anthropic']={status:'error',message:(e as Error).message};} },
    async()=>{ if (!process.env.MISTRAL_API_KEY){r['mistral']={status:'unconfigured'};return;} const m=process.env.MISTRAL_MODEL_FAST??'mistral-small-latest';const t=Date.now();try{await generateText({model:mistral(m),prompt:'hi',maxTokens:1});r['mistral']={status:'ok',latency_ms:Date.now()-t,model:m};}catch(e){r['mistral']={status:'error',message:(e as Error).message};} },
    async()=>{ if (!process.env.DEEPSEEK_API_KEY){r['deepseek']={status:'unconfigured'};return;} const ds=createOpenAI({baseURL:process.env.DEEPSEEK_BASE_URL??'https://api.deepseek.com/v1',apiKey:process.env.DEEPSEEK_API_KEY,name:'deepseek'});const m=process.env.DEEPSEEK_MODEL_FAST??'deepseek-chat';const t=Date.now();try{await generateText({model:ds(m),prompt:'hi',maxTokens:1});r['deepseek']={status:'ok',latency_ms:Date.now()-t,model:m};}catch(e){r['deepseek']={status:'error',message:(e as Error).message};} },
    async()=>{ if (!process.env.OPENAI_API_KEY){r['openai']={status:'unconfigured'};return;} const oai=createOpenAI({apiKey:process.env.OPENAI_API_KEY});const m=process.env.OPENAI_MODEL_FAST??'gpt-4o-mini';const t=Date.now();try{await generateText({model:oai(m),prompt:'hi',maxTokens:1});r['openai']={status:'ok',latency_ms:Date.now()-t,model:m};}catch(e){r['openai']={status:'error',message:(e as Error).message};} },
  ].map(fn=>fn()));
  res.json(r);
});
export default router;
