import { embed, embedMany } from 'ai';
import { getEmbeddingModel } from './provider.js';
export async function embedText(text: string): Promise<number[]> { return (await embed({model:getEmbeddingModel(),value:text})).embedding; }
export async function embedBatch(texts: string[]): Promise<number[][]> { if (!texts.length) return []; return (await embedMany({model:getEmbeddingModel(),values:texts})).embeddings; }
