import { embed, embedMany } from 'ai';
import { getEmbeddingModel } from './provider.js';

export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({ model: getEmbeddingModel(), value: text });
  return embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  const { embeddings } = await embedMany({ model: getEmbeddingModel(), values: texts });
  return embeddings;
}
