import { query } from '../db/pool.js';
import { embedText, embedBatch } from './embeddings.js';
export interface Document { id:number; org_id:number|null; collection:string; title:string|null; content:string; metadata:Record<string,unknown>; tags:string[]; similarity?:number; created_at?:string; }
export interface IngestResult { ids:number[]; count:number; }
export type IngestParams = { collection?:string; title?:string; content:string; metadata?:Record<string,unknown>; tags?:string[]; org_id?:number; };
const tbl = () => (process.env.AI_EMBEDDING_PROVIDER??'openai')==='mistral'?'meta.rag_documents_mistral':'meta.rag_documents';
const mdl = () => (process.env.AI_EMBEDDING_PROVIDER??'openai')==='mistral'?(process.env.MISTRAL_EMBEDDING_MODEL??'mistral-embed'):(process.env.OPENAI_EMBEDDING_MODEL??'text-embedding-3-small');
export async function ingestDocument(doc:IngestParams): Promise<number> {
  const e=`[${(await embedText(doc.content)).join(',')}]`;
  return (await query<{id:number}>(`INSERT INTO ${tbl()} (org_id,collection,title,content,metadata,tags,embedding,model_used) VALUES ($1,$2,$3,$4,$5,$6,$7::vector,$8) RETURNING id`,[doc.org_id??null,doc.collection??'default',doc.title??null,doc.content,JSON.stringify(doc.metadata??{}),doc.tags??[],e,mdl()]))[0].id;
}
export async function ingestBatch(docs:IngestParams[]): Promise<IngestResult> {
  if (!docs.length) return {ids:[],count:0};
  const embs=await embedBatch(docs.map(d=>d.content)); const t=tbl(); const m=mdl(); const ids:number[]=[];
  for (let i=0;i<docs.length;i++) { const d=docs[i]; const e=`[${embs[i].join(',')}]`; ids.push((await query<{id:number}>(`INSERT INTO ${t} (org_id,collection,title,content,metadata,tags,embedding,model_used) VALUES ($1,$2,$3,$4,$5,$6,$7::vector,$8) RETURNING id`,[d.org_id??null,d.collection??'default',d.title??null,d.content,JSON.stringify(d.metadata??{}),d.tags??[],e,m]))[0].id); }
  return {ids,count:ids.length};
}
export async function searchDocuments(p:{query:string;collection?:string;org_id?:number;tags?:string[];limit?:number;threshold?:number;}): Promise<Document[]> {
  const e=`[${(await embedText(p.query)).join(',')}]`; const lim=Math.min(p.limit??10,25); const thr=p.threshold??0.7;
  return query<Document>(`SELECT id,org_id,collection,title,content,metadata,tags,1-(embedding<=>$1::vector) AS similarity FROM ${tbl()} WHERE ($2::text IS NULL OR collection=$2) AND ($3::int IS NULL OR org_id=$3) AND ($4::text[] IS NULL OR tags&&$4) AND 1-(embedding<=>$1::vector)>=$5 ORDER BY embedding<=>$1::vector LIMIT $6`,[e,p.collection??null,p.org_id??null,p.tags?.length?p.tags:null,thr,lim]);
}
export async function hybridSearchDocuments(p:{query:string;collection?:string;org_id?:number;tags?:string[];limit?:number;threshold?:number;}): Promise<Document[]> {
  const k=60; const lim=Math.min(p.limit??10,25); const thr=p.threshold??0.7; const t=tbl(); const e=`[${(await embedText(p.query)).join(',')}]`;
  const vr=await query<Document&{rrf_rank:number}>(`SELECT id,org_id,collection,title,content,metadata,tags,1-(embedding<=>$1::vector) AS similarity,ROW_NUMBER() OVER (ORDER BY embedding<=>$1::vector) AS rrf_rank FROM ${t} WHERE ($2::text IS NULL OR collection=$2) AND ($3::int IS NULL OR org_id=$3) AND ($4::text[] IS NULL OR tags&&$4) AND 1-(embedding<=>$1::vector)>=$5 ORDER BY embedding<=>$1::vector LIMIT $6`,[e,p.collection??null,p.org_id??null,p.tags?.length?p.tags:null,thr,lim]);
  const br=await query<Document&{rrf_rank:number}>(`SELECT id,org_id,collection,title,content,metadata,tags,ts_rank_cd(to_tsvector('english',content||' '||COALESCE(title,'')),plainto_tsquery('english',$1)) AS similarity,ROW_NUMBER() OVER (ORDER BY ts_rank_cd(to_tsvector('english',content||' '||COALESCE(title,'')),plainto_tsquery('english',$1)) DESC) AS rrf_rank FROM ${t} WHERE ($2::text IS NULL OR collection=$2) AND ($3::int IS NULL OR org_id=$3) AND ($4::text[] IS NULL OR tags&&$4) AND to_tsvector('english',content||' '||COALESCE(title,''))@@plainto_tsquery('english',$1) ORDER BY similarity DESC LIMIT $5`,[p.query,p.collection??null,p.org_id??null,p.tags?.length?p.tags:null,lim]);
  const sc=new Map<number,{doc:Document;score:number}>();
  for (const r of vr) sc.set(r.id,{doc:r,score:1/(k+r.rrf_rank)});
  for (const r of br) { const s=1/(k+r.rrf_rank); const ex=sc.get(r.id); if (ex) ex.score+=s; else sc.set(r.id,{doc:r,score:s}); }
  return Array.from(sc.values()).sort((a,b)=>b.score-a.score).slice(0,lim).map(e=>e.doc);
}
export async function deleteDocument(id:number): Promise<void> { await query(`DELETE FROM ${tbl()} WHERE id=$1`,[id]); }
export async function listCollections(org_id?:number): Promise<string[]> { return (await query<{collection:string}>(`SELECT DISTINCT collection FROM ${tbl()} WHERE ($1::int IS NULL OR org_id=$1) ORDER BY collection`,[org_id??null])).map(r=>r.collection); }
