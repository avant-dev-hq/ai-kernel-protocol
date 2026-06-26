import { query } from '../db/pool.js';
import { randomUUID } from 'crypto';
export interface Session { id:string; user_id:string; org_id:number|null; title:string|null; agent_id:number|null; model_provider:string; model_name:string|null; system_prompt:string|null; metadata:Record<string,unknown>; tags:string[]; status:string; created_at:string; updated_at:string; }
export interface Message { id:string; session_id:string; role:'user'|'assistant'|'system'|'tool'; content:string; tool_calls:unknown|null; tool_results:unknown|null; tokens_used:number|null; cost_cents:number|null; model_used:string|null; created_at:string; }
export async function createSession(p:{user_id:string;org_id?:number;title?:string;system_prompt?:string;model_provider?:string;model_name?:string;tags?:string[];metadata?:Record<string,unknown>;}): Promise<Session> {
  return (await query<Session>(`INSERT INTO meta.assistant_sessions (id,user_id,org_id,title,model_provider,model_name,system_prompt,tags,metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,[randomUUID(),p.user_id,p.org_id??null,p.title??null,p.model_provider??process.env.AI_PROVIDER??'anthropic',p.model_name??null,p.system_prompt??null,p.tags??[],JSON.stringify(p.metadata??{})]))[0];
}
export async function getSession(id:string): Promise<Session|null> { return (await query<Session>(`SELECT * FROM meta.assistant_sessions WHERE id=$1 AND status!='archived'`,[id]))[0]??null; }
export async function listSessions(user_id:string,limit=20): Promise<Session[]> { return query<Session>(`SELECT * FROM meta.assistant_sessions WHERE user_id=$1 AND status!='archived' ORDER BY updated_at DESC LIMIT $2`,[user_id,limit]); }
export async function archiveSession(id:string): Promise<void> { await query(`UPDATE meta.assistant_sessions SET status='archived',updated_at=NOW() WHERE id=$1`,[id]); }
export async function addMessage(p:{session_id:string;role:Message['role'];content:string;tool_calls?:unknown;tool_results?:unknown;tokens_used?:number;cost_cents?:number;model_used?:string;}): Promise<Message> {
  const rows=await query<Message>(`INSERT INTO meta.assistant_messages (id,session_id,role,content,tool_calls,tool_results,tokens_used,cost_cents,model_used) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,[randomUUID(),p.session_id,p.role,p.content,p.tool_calls?JSON.stringify(p.tool_calls):null,p.tool_results?JSON.stringify(p.tool_results):null,p.tokens_used??null,p.cost_cents??null,p.model_used??null]);
  await query(`UPDATE meta.assistant_sessions SET updated_at=NOW() WHERE id=$1`,[p.session_id]);
  return rows[0];
}
export async function getMessages(session_id:string,limit=100): Promise<Message[]> { return query<Message>(`SELECT * FROM meta.assistant_messages WHERE session_id=$1 ORDER BY created_at ASC LIMIT $2`,[session_id,limit]); }
export async function getContextWindow(session_id:string,maxMessages=50): Promise<Message[]> { return query<Message>(`SELECT * FROM (SELECT * FROM meta.assistant_messages WHERE session_id=$1 ORDER BY created_at DESC LIMIT $2) sub ORDER BY created_at ASC`,[session_id,maxMessages]); }
