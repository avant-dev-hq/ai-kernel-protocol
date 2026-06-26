import { query } from '../db/pool.js';
import { ingestDocument, searchDocuments, type IngestParams, type Document } from './rag.js';

export interface RagObservation {
  id:number; query_text:string|null; collection:string; results_count:number;
  top_similarity:number|null; latency_ms:number; model_used:string; created_at:string;
}

async function record(queryText:string|null,collection:string,resultsCount:number,
  topSimilarity:number|null,latencyMs:number,modelUsed:string) {
  await query(
    `INSERT INTO meta.rag_observations (query_text,collection,results_count,top_similarity,latency_ms,model_used)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [queryText,collection,resultsCount,topSimilarity,latencyMs,modelUsed]
  );
}

export async function observedIngest(doc: IngestParams): Promise<number> {
  const model=process.env.OPENAI_EMBEDDING_MODEL??'text-embedding-3-small';
  const t=Date.now(); const id=await ingestDocument(doc);
  record(null,doc.collection??'default',1,null,Date.now()-t,model).catch(()=>{});
  return id;
}

export async function observedSearch(p: Parameters<typeof searchDocuments>[0]): Promise<Document[]> {
  const model=process.env.OPENAI_EMBEDDING_MODEL??'text-embedding-3-small';
  const t=Date.now(); const results=await searchDocuments(p);
  const top=results.length>0&&results[0].similarity!=null?Number(results[0].similarity):null;
  record(p.query,p.collection??'default',results.length,top,Date.now()-t,model).catch(()=>{});
  return results;
}

export async function listObservations(p:{collection?:string;limit?:number}): Promise<RagObservation[]> {
  return query<RagObservation>(
    `SELECT id,query_text,collection,results_count,top_similarity,latency_ms,model_used,created_at
     FROM meta.rag_observations WHERE ($1::text IS NULL OR collection=$1)
     ORDER BY created_at DESC LIMIT $2`,
    [p.collection??null,Math.min(p.limit??50,200)]);
}
