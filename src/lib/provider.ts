import { anthropic } from '@ai-sdk/anthropic';
import { mistral }   from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
export type SupportedProvider = 'anthropic'|'mistral'|'deepseek'|'openai';
export interface ModelTier { fast: ReturnType<typeof anthropic>; standard: ReturnType<typeof anthropic>; advanced: ReturnType<typeof anthropic>; }
export function getModelTier(override?: string): ModelTier {
  const p = (override ?? process.env.AI_PROVIDER ?? 'anthropic') as SupportedProvider;
  if (p==='anthropic') return { fast:anthropic(process.env.ANTHROPIC_MODEL_FAST??'claude-haiku-4-5'), standard:anthropic(process.env.ANTHROPIC_MODEL_STANDARD??'claude-sonnet-4-5'), advanced:anthropic(process.env.ANTHROPIC_MODEL_ADVANCED??'claude-opus-4-5') } as unknown as ModelTier;
  if (p==='mistral')   return { fast:mistral(process.env.MISTRAL_MODEL_FAST??'mistral-small-latest'), standard:mistral(process.env.MISTRAL_MODEL_STANDARD??'mistral-large-latest'), advanced:mistral(process.env.MISTRAL_MODEL_ADVANCED??'mistral-large-latest') } as unknown as ModelTier;
  if (p==='deepseek') { const ds=createOpenAI({baseURL:process.env.DEEPSEEK_BASE_URL??'https://api.deepseek.com/v1',apiKey:process.env.DEEPSEEK_API_KEY??'',name:'deepseek'}); return { fast:ds(process.env.DEEPSEEK_MODEL_FAST??'deepseek-chat'), standard:ds(process.env.DEEPSEEK_MODEL_STANDARD??'deepseek-chat'), advanced:ds(process.env.DEEPSEEK_MODEL_ADVANCED??'deepseek-reasoner') } as unknown as ModelTier; }
  if (p==='openai')   { const oai=createOpenAI({apiKey:process.env.OPENAI_API_KEY??''}); return { fast:oai(process.env.OPENAI_MODEL_FAST??'gpt-4o-mini'), standard:oai(process.env.OPENAI_MODEL_STANDARD??'gpt-4o'), advanced:oai(process.env.OPENAI_MODEL_ADVANCED??'gpt-4o') } as unknown as ModelTier; }
  throw new Error(`Unsupported AI_PROVIDER: "${p}". Valid: anthropic|mistral|deepseek|openai`);
}
export function getEmbeddingModel() {
  if ((process.env.AI_EMBEDDING_PROVIDER??'openai')==='mistral') return mistral.textEmbeddingModel(process.env.MISTRAL_EMBEDDING_MODEL??'mistral-embed');
  return createOpenAI({apiKey:process.env.OPENAI_API_KEY??''}).embedding(process.env.OPENAI_EMBEDDING_MODEL??'text-embedding-3-small');
}
export const getProviderName = () => process.env.AI_PROVIDER ?? 'anthropic';
export const getEmbeddingProviderName = () => process.env.AI_EMBEDDING_PROVIDER ?? 'openai';
