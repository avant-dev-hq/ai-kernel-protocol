# AI Kernel Protocol (AKP)

> **A provider-agnostic intelligence layer built on top of MCP.**
> Where MCP gives models context, AKP gives them memory, skills, and intelligence.

[![License: AKP v1.0](https://img.shields.io/badge/License-AKP%20v1.0-blue.svg)](LICENSE)
[![Spec Version](https://img.shields.io/badge/Spec-0.1.0-green.svg)](SPEC.md)
[![Author](https://img.shields.io/badge/Author-Erick%20Gonz%C3%A1lez%20Aguilar-black.svg)](https://avant.dev)

---

## The Problem AKP Solves

MCP standardized how AI applications connect to tools and context. But three critical gaps remained:

1. **Provider lock-in** — Every integration hardcodes a specific LLM provider. Swapping Claude for Mistral means rewriting your entire inference layer.
2. **Stateless intelligence** — MCP tools fire and forget. No standard for persistent memory across sessions or conversations.
3. **Retrieval without standards** — RAG exists everywhere, implemented differently everywhere. No standard interface for semantic search, hybrid retrieval, or pipeline observability.

AKP solves all three — as a layer **on top of MCP**, not a replacement.

---

## What AKP Is

```
Your Application
       ↓
┌──────────────────────────────────────────────────────┐
│        AI Kernel Protocol (AKP)                      │
│  Memory · RAG · Skills · Provider Abstraction        │
│  (This layer — defined by this specification)        │
└──────────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────┐
│        Model Context Protocol (MCP)                  │
│        Tools · Resources · Prompts                   │
└──────────────────────────────────────────────────────┘
       ↓
  LLM Provider  ←  Claude · Mistral · Deepseek · OpenAI
```

**AKP does NOT replace MCP.** It extends it. AKP implementations expose Skills as MCP tools, and can consume MCP servers as skill sources.

---

## The H2O Principle

> Water is H₂O — always. Whether you drink it from a mountain spring, a bottle, or a tap, the molecule is the same.

AKP defines the molecule. Your application calls `POST /chat` and gets streaming intelligence back. Whether the model is Claude Opus, Mistral Large, or Deepseek Reasoner is an infrastructure concern — not a code concern.

```bash
# This is ALL you change to swap your entire inference stack:
AI_PROVIDER=anthropic   # → Claude Haiku/Sonnet/Opus
AI_PROVIDER=mistral     # → Mistral Small/Large
AI_PROVIDER=deepseek    # → DeepSeek Chat/Reasoner
AI_PROVIDER=openai      # → GPT-4o Mini/4o
```

Zero code changes. Same RAG. Same Memory. Same Skills.

---

## Core Primitives

AKP defines four intelligence primitives:

### 1. Provider Abstraction
A three-tier model factory (`fast` / `standard` / `advanced`) that resolves to the correct model for any registered provider. → [`spec/provider.md`](spec/provider.md)

### 2. Memory
Structured, durable session and message persistence with context window management. → [`spec/memory.md`](spec/memory.md)

### 3. RAG
Standard interfaces for document ingest, vector semantic search, BM25 full-text search, and hybrid Reciprocal Rank Fusion (RRF) retrieval with observability. → [`spec/rag.md`](spec/rag.md)

### 4. Skills
A composable tool registry — AKP Skills work with ANY provider. One skill definition, any inference backend. → [`spec/skills.md`](spec/skills.md)

---

## API Surface

```http
# Chat — SSE stream or JSON response
POST /chat

# RAG
POST /rag/ingest
POST /rag/ingest/batch
POST /rag/search
POST /rag/hybrid-search      ← BM25 + vector + RRF
GET  /rag/observations       ← Pipeline observability

# Memory
POST /memory/sessions
GET  /memory/sessions?user_id=
GET  /memory/sessions/:id/messages
POST /memory/sessions/:id/messages

# Health
GET  /health
GET  /health/providers       ← Live provider connectivity
```

---

## SSE Stream Wire Format

Provider-independent. Same client for every provider:

```
data: {"type":"text","delta":"..."}
data: {"type":"tool_call","name":"..."}
data: {"type":"tool_result","name":"..."}
data: {"type":"done","usage":{"promptTokens":N,"completionTokens":N}}
data: {"type":"error","error":"..."}
```

---

## Repository Structure

```
ai-kernel-protocol/
├── SPEC.md              — Protocol specification
├── LICENSE              — Avant.Dev Source Available License v1.0
├── spec/
│   ├── provider.md      — Provider abstraction primitive
│   ├── memory.md        — Memory primitive
│   ├── rag.md           — RAG primitive
│   ├── skills.md        — Skills primitive
│   └── wire-format.md   — SSE + REST wire format
├── packages/
│   └── akp-core/        — TypeScript interfaces (MIT sublicense)
├── examples/
│   ├── minimal-provider.ts
│   └── custom-skill.ts
└── docs/
    ├── introduction.md
    ├── mcp-relationship.md
    └── quickstart.md
```

---

## Conformance Checklist

An AKP-conformant kernel MUST implement:

- [ ] Three-tier provider factory (`fast` / `standard` / `advanced`)
- [ ] Provider selection via `AI_PROVIDER` env var, zero code changes
- [ ] `POST /chat` with SSE streaming and JSON mode
- [ ] Memory: session + message persistence (durable, not in-memory)
- [ ] RAG: ingest + semantic search + collections
- [ ] Skill registry with partial tool selection
- [ ] `GET /health` reporting active provider
- [ ] Attribution per LICENSE Section 3

---

## Reference Implementation

The Avant.Dev reference implementation — `acervo-ai-kernel` — is a private, production-grade TypeScript/Express service implementing the full AKP specification. It powers [pn.avant.dev](https://pn.avant.dev) (Policy Navigator) and the native iOS policy intelligence app.

The reference implementation is proprietary. This repository defines the open specification it implements.

---

## Why This Exists

AKP was designed to fulfill a concrete operational need: building AI intelligence infrastructure for organizations in developing countries that cannot afford lock-in to a single cloud provider's AI offering.

Avant.Dev is a signatory of [ITU Partner2Connect Pledge #7528](https://www.itu.int/partner2connect/) — *"LAC AI Governance Policy Intelligence: Bridging the Technical Community Gap in Global Standards Processes"* — active in:

**Mexico · Colombia · Brazil · Argentina · Chile · Peru · Ecuador · Costa Rica · Dominican Republic · Panama**

For practitioners in these countries, provider agnosticism is not a preference — it is a requirement for sovereign, cost-effective, and resilient AI operations.

---

## License

| Use Case | License |
|----------|--------|
| Personal, research, education | ✅ Free, attribution required |
| Open-source implementation | ✅ Free, attribution + same license |
| Internal enterprise use | ✅ Free, attribution required |
| `@avant-dev/akp-core` TypeScript interfaces | ✅ MIT sublicense |
| Managed service / SaaS offering | ❌ Requires Commercial License |
| Removing attribution | ❌ Prohibited |

Commercial licensing: [licensing@avant.dev](mailto:licensing@avant.dev)

See [`LICENSE`](LICENSE) for full terms.

---

**Designed and authored by Erick González Aguilar**  
[Avant.Dev](https://avant.dev) · Mexico City · [UN ITU P2C Pledge #7528](https://www.itu.int/partner2connect/)

© 2026 Erick González Aguilar. All rights reserved.
