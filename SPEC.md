# AI Kernel Protocol Specification v0.1.0

**Author:** Erick González Aguilar / Avant.Dev  
**Status:** Draft  
**Date:** 2026-06-24  
**Relation to MCP:** Layer built on top of Model Context Protocol 2025-11-25  
**License:** Avant.Dev Source Available License v1.0  

---

## Abstract

The AI Kernel Protocol (AKP) is an open specification for a provider-agnostic intelligence layer that builds on top of the Model Context Protocol (MCP). AKP standardizes four intelligence primitives — Provider Abstraction, Memory, RAG, and Skills — enabling any conforming implementation to work identically with Claude, Mistral, Deepseek, OpenAI, or any other LLM provider. AKP does not replace MCP; it extends it.

---

## 1. Relationship to MCP

```
Application Layer
      ↓
┌──────────────────────────────────────────────────────────┐
│                AI Kernel Protocol (AKP)                  │
│           Memory · RAG · Skills · Provider               │
└──────────────────────────────────────────────────────────┘
      ↓
┌──────────────────────────────────────────────────────────┐
│           Model Context Protocol (MCP)                   │
│              Tools · Resources · Prompts                 │
└──────────────────────────────────────────┘
      ↓
  LLM Provider  ←  Any MCP-compatible inference backend
```

MCP is a stateful JSON-RPC session protocol for connecting applications to external tools, resources, and prompts. AKP is a higher-level REST/SSE protocol for intelligence operations — using MCP servers as tool sources and LLM providers as inference backends.

---

## 2. Design Principles

### 2.1 H2O Principle
Changing `AI_PROVIDER` MUST NOT require any code changes in consuming applications.

### 2.2 Primitive Isolation
Each AKP primitive (Provider, Memory, RAG, Skills) MUST be independently replaceable.

### 2.3 Observable Pipeline
Implementations SHOULD support pipeline observability — inspect intermediate artifacts at each stage (parse → chunk → embed → retrieve → context → generate).

### 2.4 MCP Composability
AKP Skills MUST be expressible as MCP tools. An AKP kernel SHOULD expose its skill registry as an MCP server.

### 2.5 Streaming First
All inference endpoints MUST support Server-Sent Events (SSE) streaming.

---

## 3. Provider Abstraction Primitive

See: [spec/provider.md](spec/provider.md)

### 3.1 Model Tiers

| Tier | Anthropic | Mistral | Deepseek | OpenAI |
|------|-----------|---------|----------|--------|
| `fast` | claude-haiku-4-5 | mistral-small-latest | deepseek-chat | gpt-4o-mini |
| `standard` | claude-sonnet-4-5 | mistral-large-latest | deepseek-chat | gpt-4o |
| `advanced` | claude-opus-4-5 | mistral-large-latest | deepseek-reasoner | gpt-4o |

### 3.2 Provider Selection
`AI_PROVIDER` env var switches provider without code changes. Active provider MUST be reported by `GET /health`.

---

## 4. Memory Primitive

See: [spec/memory.md](spec/memory.md)

**Session:** `id(UUID) · user_id · model_provider · status(active|archived) · timestamps`  
**Message:** `id(UUID) · session_id(FK) · role(user|assistant|system|tool) · content · tokens_used`

- `getContextWindow(sessionId, max)` MUST return last N messages ordered chronologically (oldest first).
- Memory MUST be durable (survive process restarts).

---

## 5. RAG Primitive

See: [spec/rag.md](spec/rag.md)

| Operation | Endpoint | Conformance |
|-----------|----------|-------------|
| Ingest single | `POST /rag/ingest` | REQUIRED |
| Ingest batch | `POST /rag/ingest/batch` | REQUIRED |
| Semantic search | `POST /rag/search` | REQUIRED |
| Hybrid search | `POST /rag/hybrid-search` | RECOMMENDED |
| List collections | `GET /rag/collections` | REQUIRED |
| Delete document | `DELETE /rag/:id` | REQUIRED |
| Observations | `GET /rag/observations` | RECOMMENDED |

**Hybrid Search RRF:** `score = 1/(60 + rank_vector) + 1/(60 + rank_bm25)`  
**Embedding independence:** `AI_EMBEDDING_PROVIDER` configures embeddings separately from inference.

---

## 6. Skills Primitive

See: [spec/skills.md](spec/skills.md)

```typescript
interface IAKPSkill {
  name: string;           // snake_case, unique
  description: string;    // Natural language for the model
  parameters: ZodSchema;  // Input validation + JSON Schema
  execute(params: unknown, context?: AKPContext): Promise<string>;
}
```

Implementations SHOULD expose skills as MCP tools.

---

## 7. Chat Endpoint — Wire Format

See: [spec/wire-format.md](spec/wire-format.md)

**Request:** `{ messages, tier?, tools?, session_id?, stream?, max_steps? }`  
**SSE events:** `text | tool_call | tool_result | done | error`  
**Auth:** `Authorization: Bearer <token>` required on all endpoints except `GET /health`.

---

## 8. Health Endpoints

```json
GET /health → {"status":"ok","provider":"anthropic","embedding_provider":"openai","ts":"..."}
GET /health/providers → {"anthropic":{"status":"ok","latency_ms":220},"mistral":{"status":"unconfigured"}}
```

---

## 9. Conformance

MUST: three-tier factory · AI_PROVIDER switching · POST /chat SSE+JSON · durable memory · RAG ingest+search · skill registry · GET /health · attribution  
SHOULD: hybrid search RRF · MCP bridge · GET /health/providers · GET /rag/observations

---

## 10. Versioning

Semantic versioning. Breaking changes → major version increment. Current: `0.1.0`.  
Version negotiation via `AKP-Version` HTTP header (optional in v0.1, required from v1.0).

---

*Designed by Erick González Aguilar · Avant.Dev · Mexico City*  
*ITU P2C Pledge #7528 — Argentina · Barbados · Brazil · Chile · Colombia · Guatemala · Jamaica · Mexico · Panama · Venezuela*  
*© 2026 Erick González Aguilar. All rights reserved.*
