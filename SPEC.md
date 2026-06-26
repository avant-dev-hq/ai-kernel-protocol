# AI Kernel Protocol Specification v0.1.0

**Author:** Erick González Aguilar / Avant.Dev  
**Status:** Draft  
**Date:** 2026-06-24  
**Relation to MCP:** Layer built on top of Model Context Protocol 2025-11-25  
**License:** Avant.Dev Source Available License v1.0  

---

## Abstract

The AI Kernel Protocol (AKP) is an open specification for a provider-agnostic intelligence layer that builds on top of the Model Context Protocol (MCP). AKP standardizes the interfaces, wire formats, and behavioral contracts for four intelligence primitives — Provider Abstraction, Memory, RAG, and Skills — enabling any conforming implementation to work identically with Claude, Mistral, Deepseek, OpenAI, or any other LLM provider.

AKP does not replace MCP. AKP implementations expose their capabilities as MCP tools and can consume MCP servers as skill sources.

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
└──────────────────────────────────────────────────────────┘
      ↓
  LLM Provider  ←  Any MCP-compatible inference backend
```

**MCP** is a stateful session protocol (JSON-RPC over Streamable HTTP/stdio) for connecting applications to external tools, resources, and prompts.

**AKP** is a higher-level REST/SSE protocol for intelligence operations. It uses MCP servers as tool sources and LLM providers as inference backends, but defines its own wire format optimized for streaming intelligence workflows.

---

## 2. Design Principles

### 2.1 H2O Principle
An AKP-compliant implementation MUST behave identically regardless of the underlying LLM provider. Changing `AI_PROVIDER` MUST NOT require any code changes in consuming applications.

### 2.2 Primitive Isolation
Each AKP primitive (Provider, Memory, RAG, Skills) MUST be independently replaceable.

### 2.3 Observable Pipeline
AKP implementations SHOULD support pipeline observability — the ability to inspect intermediate artifacts at each stage (parse → chunk → embed → retrieve → context → generate).

### 2.4 MCP Composability
AKP Skills MUST be expressible as MCP tools. An AKP kernel SHOULD expose its skill registry as an MCP server.

### 2.5 Streaming First
All inference endpoints MUST support Server-Sent Events (SSE) streaming.

---

## 3. Provider Abstraction Primitive

See: [`spec/provider.md`](spec/provider.md)

### 3.1 Model Tiers

| Tier | Description | Anthropic | Mistral | Deepseek | OpenAI |
|------|-------------|-----------|---------|----------|--------|
| `fast` | Low-latency, high-volume | claude-haiku-4-5 | mistral-small-latest | deepseek-chat | gpt-4o-mini |
| `standard` | Balanced | claude-sonnet-4-5 | mistral-large-latest | deepseek-chat | gpt-4o |
| `advanced` | Max reasoning | claude-opus-4-5 | mistral-large-latest | deepseek-reasoner | gpt-4o |

### 3.2 Provider Selection
Provider MUST be selectable via `AI_PROVIDER` environment variable without code changes. Active provider MUST be reported by `GET /health`.

---

## 4. Memory Primitive

See: [`spec/memory.md`](spec/memory.md)

### 4.1 Session Model

```
Session: id(UUID) · user_id · model_provider · status(active|archived) · timestamps
Message: id(UUID) · session_id(FK) · role(user|assistant|system|tool) · content · tokens_used
```

### 4.2 Context Window Management
`getContextWindow(sessionId, maxMessages)` MUST return last N messages ordered chronologically (oldest first) for model consumption.

### 4.3 Durability
Memory MUST survive process restarts. In-memory-only implementations do not conform to AKP.

---

## 5. RAG Primitive

See: [`spec/rag.md`](spec/rag.md)

### 5.1 Required Operations

| Operation | Endpoint | Conformance |
|-----------|----------|-------------|
| Ingest single | `POST /rag/ingest` | REQUIRED |
| Ingest batch | `POST /rag/ingest/batch` | REQUIRED |
| Semantic search | `POST /rag/search` | REQUIRED |
| Hybrid search (RRF) | `POST /rag/hybrid-search` | RECOMMENDED |
| List collections | `GET /rag/collections` | REQUIRED |
| Delete document | `DELETE /rag/:id` | REQUIRED |
| Observations | `GET /rag/observations` | RECOMMENDED |

### 5.2 Hybrid Search — Reciprocal Rank Fusion
```
RRF score = 1/(60 + rank_vector) + 1/(60 + rank_bm25)
```

### 5.3 Embedding Independence
`AI_EMBEDDING_PROVIDER` configures embeddings separately from inference. Implementations MUST handle providers without native embedding support.

---

## 6. Skills Primitive

See: [`spec/skills.md`](spec/skills.md)

### 6.1 Skill Interface
```typescript
interface IAKPSkill {
  name: string;           // snake_case, unique
  description: string;    // Natural language for the model
  parameters: ZodSchema;  // Input validation + JSON Schema
  execute(params: unknown, context?: AKPContext): Promise<string>;
}
```

### 6.2 MCP Bridge
Implementations SHOULD expose skills as MCP tools, making each skill invocable by any MCP-compatible client.

---

## 7. Chat Endpoint — Wire Format

See: [`spec/wire-format.md`](spec/wire-format.md)

### 7.1 Request
```json
{
  "messages": [{"role": "user", "content": "string"}],
  "tier": "fast|standard|advanced",
  "tools": ["skill_name"],
  "session_id": "uuid",
  "stream": true,
  "max_steps": 5
}
```

### 7.2 SSE Events
```
data: {"type":"text","delta":"..."}
data: {"type":"tool_call","name":"skill_name"}
data: {"type":"tool_result","name":"skill_name"}
data: {"type":"done","usage":{"promptTokens":N,"completionTokens":N}}
data: {"type":"error","error":"message"}
```

### 7.3 Authentication
All endpoints MUST support `Authorization: Bearer <token>`. `GET /health` MAY be unauthenticated.

---

## 8. Health Endpoints

### GET /health
```json
{"status":"ok","server":"akp-kernel","version":"0.1.0","provider":"anthropic","embedding_provider":"openai","ts":"ISO8601"}
```

### GET /health/providers (RECOMMENDED)
```json
{
  "anthropic": {"status":"ok","latency_ms":220,"model":"claude-haiku-4-5"},
  "mistral":   {"status":"unconfigured"},
  "deepseek":  {"status":"unconfigured"},
  "openai":    {"status":"ok","latency_ms":180,"model":"gpt-4o-mini"}
}
```

---

## 9. Conformance

An AKP-conformant kernel MUST:
- [ ] Three-tier model factory (Section 3.1)
- [ ] `AI_PROVIDER` switches provider without code changes (Section 3.2)
- [ ] `POST /chat` with SSE + JSON modes (Section 7)
- [ ] Durable Memory: session + message CRUD + context window (Section 4)
- [ ] RAG: ingest + semantic search + collections (Section 5.1)
- [ ] Skill registry with partial selection (Section 6.2)
- [ ] `GET /health` reporting active provider (Section 8)
- [ ] Attribution notice per LICENSE Section 3

An AKP-conformant kernel SHOULD:
- [ ] Hybrid search with RRF (Section 5.2)
- [ ] MCP bridge for skills (Section 6.2)
- [ ] `GET /health/providers` (Section 8)
- [ ] `GET /rag/observations` for pipeline observability (Section 5)

---

## 10. Versioning

This specification uses semantic versioning. Breaking changes increment the major version. Current: `0.1.0`.

Version negotiation via `AKP-Version` HTTP header (optional in v0.1, required from v1.0).

---

*Designed by Erick González Aguilar · Avant.Dev · Mexico City*  
*Built in support of ITU Partner2Connect Pledge #7528 — LAC AI Governance*  
*Mexico · Colombia · Brazil · Argentina · Chile · Peru · Ecuador · Costa Rica · Dominican Republic · Panama*  
*© 2026 Erick González Aguilar. All rights reserved.*
