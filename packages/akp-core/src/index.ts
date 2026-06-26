/**
 * @package @avant-dev/akp-core
 * Core TypeScript interfaces for the AI Kernel Protocol (AKP)
 *
 * AI Kernel Protocol (AKP) — A provider-agnostic intelligence layer built on MCP.
 * Designed by Erick González Aguilar · Avant.Dev · https://avant.dev
 * © 2026 Erick González Aguilar. All rights reserved.
 *
 * This package is sublicensed under MIT — see LICENSE in the root of the
 * ai-kernel-protocol repository for the parent license.
 *
 * Attribution required per LICENSE Section 3:
 * "Implements AI Kernel Protocol (AKP) — designed by Erick González Aguilar,
 *  Avant.Dev · https://github.com/avant-dev-hq/ai-kernel-protocol"
 */

// ── Provider ──────────────────────────────────────────────────────────────────

export type AKPProvider = 'anthropic' | 'mistral' | 'deepseek' | 'openai';

export interface AKPModelTier<TModel = unknown> {
  fast: TModel;
  standard: TModel;
  advanced: TModel;
}

export type AKPProviderStatus =
  | { status: 'ok'; latency_ms: number; model: string }
  | { status: 'unconfigured' }
  | { status: 'error'; message: string };

export type AKPProviderHealthMap = Record<string, AKPProviderStatus>;

// ── Memory ───────────────────────────────────────────────────────────

export type AKPSessionStatus = 'active' | 'archived' | 'deleted';
export type AKPMessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface AKPSession {
  id: string;
  user_id: string;
  org_id?: number | null;
  title?: string | null;
  agent_id?: number | null;
  model_provider: string;
  model_name?: string | null;
  system_prompt?: string | null;
  metadata: Record<string, unknown>;
  tags: string[];
  status: AKPSessionStatus;
  created_at: string;
  updated_at: string;
}

export interface AKPMessage {
  id: string;
  session_id: string;
  role: AKPMessageRole;
  content: string;
  tool_calls?: unknown | null;
  tool_results?: unknown | null;
  tokens_used?: number | null;
  cost_cents?: number | null;
  model_used?: string | null;
  created_at: string;
}

export interface AKPCreateSessionParams {
  user_id: string;
  org_id?: number;
  title?: string;
  system_prompt?: string;
  model_provider?: string;
  model_name?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface AKPAddMessageParams {
  session_id: string;
  role: AKPMessageRole;
  content: string;
  tool_calls?: unknown;
  tool_results?: unknown;
  tokens_used?: number;
  cost_cents?: number;
  model_used?: string;
}

export interface IAKPMemory {
  createSession(params: AKPCreateSessionParams): Promise<AKPSession>;
  getSession(id: string): Promise<AKPSession | null>;
  listSessions(user_id: string, limit?: number): Promise<AKPSession[]>;
  archiveSession(id: string): Promise<void>;
  addMessage(params: AKPAddMessageParams): Promise<AKPMessage>;
  getMessages(session_id: string, limit?: number): Promise<AKPMessage[]>;
  getContextWindow(session_id: string, maxMessages?: number): Promise<AKPMessage[]>;
}

// ── RAG ───────────────────────────────────────────────────────────────────────

export interface AKPDocument {
  id: number;
  org_id?: number | null;
  collection: string;
  title?: string | null;
  content: string;
  metadata: Record<string, unknown>;
  tags: string[];
  similarity?: number;
  created_at?: string;
}

export interface AKPIngestParams {
  content: string;
  collection?: string;
  title?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  org_id?: number;
}

export interface AKPIngestBatchResult {
  ids: number[];
  count: number;
}

export interface AKPSearchParams {
  query: string;
  collection?: string;
  org_id?: number;
  tags?: string[];
  limit?: number;
  threshold?: number;
}

export interface AKPRagObservation {
  id: number;
  query_text: string | null;
  collection: string;
  results_count: number;
  top_similarity: number | null;
  latency_ms: number;
  model_used: string;
  created_at: string;
}

export interface IAKPRag {
  ingestDocument(doc: AKPIngestParams): Promise<number>;
  ingestBatch(docs: AKPIngestParams[]): Promise<AKPIngestBatchResult>;
  searchDocuments(params: AKPSearchParams): Promise<AKPDocument[]>;
  hybridSearchDocuments(params: AKPSearchParams): Promise<AKPDocument[]>;
  deleteDocument(id: number): Promise<void>;
  listCollections(org_id?: number): Promise<string[]>;
}

// ── Skills ───────────────────────────────────────────────────────────────────

export interface AKPContext {
  session_id?: string;
  user_id?: string;
  org_id?: number;
  provider: AKPProvider;
  tier: 'fast' | 'standard' | 'advanced';
}

export interface IAKPSkill {
  name: string;
  description: string;
  parameters: unknown; // ZodSchema
  execute(params: unknown, context?: AKPContext): Promise<string>;
}

export interface IAKPSkillRegistry {
  register(skill: IAKPSkill): void;
  get(name: string): IAKPSkill | undefined;
  list(): IAKPSkill[];
  resolve(names?: string[]): IAKPSkill[];
}

// ── Chat ────────────────────────────────────────────────────────

export interface AKPChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AKPChatRequest {
  messages: AKPChatMessage[];
  tier?: 'fast' | 'standard' | 'advanced';
  provider?: AKPProvider;
  tools?: string[];
  session_id?: string;
  stream?: boolean;
  max_steps?: number;
  system?: string;
}

export interface AKPChatResponse {
  text: string;
  usage: { promptTokens: number; completionTokens: number };
  finish_reason?: string;
  tool_results?: unknown[];
}

export type AKPStreamEvent =
  | { type: 'text'; delta: string }
  | { type: 'tool_call'; name: string; input?: unknown }
  | { type: 'tool_result'; name: string; result?: string }
  | { type: 'done'; usage: { promptTokens: number; completionTokens: number } }
  | { type: 'error'; error: string };

// ── Health ────────────────────────────────────────────────────────────────────

export interface AKPHealthResponse {
  status: 'ok' | 'error';
  server: string;
  version?: string;
  provider: string;
  embedding_provider: string;
  ts: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const AKP_VERSION = '0.1.0' as const;
export const AKP_RRF_K = 60 as const;
export const AKP_DEFAULT_CONTEXT_WINDOW = 50 as const;
export const AKP_DEFAULT_SIMILARITY_THRESHOLD = 0.7 as const;
export const AKP_MAX_SEARCH_RESULTS = 25 as const;
export const AKP_PROVIDERS = ['anthropic', 'mistral', 'deepseek', 'openai'] as const;
export const AKP_TIERS = ['fast', 'standard', 'advanced'] as const;
