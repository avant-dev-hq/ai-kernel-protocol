# AI Kernel Protocol (AKP)

> **A provider-agnostic intelligence layer built on top of MCP.**  
> Where MCP gives models context, AKP gives them memory, skills, and intelligence.

[![License: AKP v1.0](https://img.shields.io/badge/License-AKP%20v1.0-blue.svg)](LICENSE)
[![Spec Version](https://img.shields.io/badge/Spec-0.1.0-green.svg)](SPEC.md)
[![Author](https://img.shields.io/badge/Author-Erick%20Gonz%C3%A1lez%20Aguilar-black.svg)](https://avant.dev)
[![ITU P2C](https://img.shields.io/badge/ITU%20P2C-Pledge%20%237528-009cde.svg)](docs/p2c-pledge.md)

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
┌──────────────────────────────────────────────────────┐
│        Model Context Protocol (MCP)                  │
│        Tools · Resources · Prompts                   │
└──────────────────────────────────────────────────────┘
       ↓
  LLM Provider  ←  Claude · Mistral · Deepseek · OpenAI
```

**AKP does NOT replace MCP.** It extends it. AKP implementations expose Skills as MCP tools, and can consume MCP servers as skill sources.

---

## The H2O Principle

> Water is H₂O — always. Whether from a mountain spring, a bottle, or a tap, the molecule is the same.

AKP defines the molecule. Change `AI_PROVIDER` — that's it. Zero code changes. Same RAG. Same Memory. Same Skills.

```bash
AI_PROVIDER=anthropic   # → Claude Haiku/Sonnet/Opus
AI_PROVIDER=mistral     # → Mistral Small/Large (European sovereign option)
AI_PROVIDER=deepseek    # → DeepSeek Chat/Reasoner
AI_PROVIDER=openai      # → GPT-4o Mini/4o
```

---

## Core Primitives

| Primitive | Spec | Description |
|-----------|------|-------------|
| **Provider** | [spec/provider.md](spec/provider.md) | Three-tier model factory (fast/standard/advanced), any provider |
| **Memory** | [spec/memory.md](spec/memory.md) | Durable session + message persistence with context window management |
| **RAG** | [spec/rag.md](spec/rag.md) | Ingest, semantic search, hybrid BM25+vector RRF, pipeline observability |
| **Skills** | [spec/skills.md](spec/skills.md) | Provider-agnostic tool registry, exposed as MCP tools |

---

## API Surface

```http
POST /chat                     ← SSE stream or JSON, any provider
POST /rag/ingest               ← Embed + store document
POST /rag/ingest/batch         ← Batch embed + store
POST /rag/search               ← Semantic vector search
POST /rag/hybrid-search        ← BM25 + vector + RRF
GET  /rag/observations         ← Pipeline observability
POST /memory/sessions          ← Create session
GET  /memory/sessions/:id/messages
POST /memory/sessions/:id/messages
GET  /health                   ← Provider + DB status
GET  /health/providers         ← Live provider connectivity
```

---

## SSE Stream Wire Format

Provider-independent. Same iOS client, same web frontend, same CLI — always:

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
├── SPEC.md              — Protocol specification v0.1.0
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
    ├── quickstart.md
    └── p2c-pledge.md    — ITU P2C #7528 policy commitment & addendum
```

---

## Conformance Checklist

An AKP-conformant kernel MUST:
- [ ] Three-tier model factory (fast / standard / advanced)
- [ ] `AI_PROVIDER` switches provider without code changes
- [ ] `POST /chat` with SSE streaming and JSON mode
- [ ] Durable Memory: session + message CRUD + context window
- [ ] RAG: ingest + semantic search + collections
- [ ] Skill registry with partial tool selection
- [ ] `GET /health` reporting active provider
- [ ] Attribution per LICENSE Section 3

---

## Reference Implementation

The Avant.Dev reference implementation — `acervo-ai-kernel` — is a private, production-grade TypeScript/Express service implementing the full AKP specification. It is deployed in production, serving institutional intelligence use cases.

The reference implementation is proprietary. This repository defines the open specification it implements.

---

## Why This Exists

AKP was designed by **Erick González Aguilar** (Avant.Dev, Mexico City) to answer a question that technical specifications rarely ask:

**What does a person earning $2 a day need from artificial intelligence?**

Not a chatbot. Not a subscription. Not a registration form.

They need the same answer a $200/hour lawyer gives someone in Manhattan — in their language, on the device they already own, at the moment they need it, for free.

AKP is the infrastructure that makes that possible.

---

## The Real Scope

Avant.Dev holds [ITU Partner2Connect Pledge #7528](docs/p2c-pledge.md) — validated May 15, 2026, active in:

**Argentina · Barbados · Brazil · Chile · Colombia · Guatemala · Jamaica · Mexico · Panama · Venezuela**

The formal ITU pledge metric is 27,079. The real addressable population is different:

| Country | People in precarious informality |
|---------|----------------------------------|
| 🇲🇽 Mexico | ~35M |
| 🇧🇷 Brazil | ~90M |
| 🇨🇴 Colombia | ~20M |
| 🇦🇷 Argentina | ~12M |
| 🇨🇱 Chile | ~8M |
| 🇬🇹 Guatemala | ~10M |
| 🇯🇲 Jamaica | ~800K |
| 🇵🇦 Panama | ~1M |
| 🇻🇪 Venezuela | ~15M |
| 🇧🇧 Barbados | ~200K |
| **Total** | **~300M** |

These are street vendors, day laborers, domestic workers, rural families, artisans, musicians, informal entrepreneurs — people excluded from formal legal systems, unable to afford lawyers or accountants, navigating government bureaucracy alone at night on a borrowed phone.

They are not edge cases. They are the majority.

**The architecture:**
- Interface: WhatsApp — the device they already have
- Engine: AKP — sovereign, provider-agnostic, zero lock-in
- Deployer: cooperatives, municipalities, cultural centers, IDB programs
- Cost to end user: **zero. always.**

For institutions deploying AKP to serve these communities, provider agnosticism is not a preference — it is a requirement. When bilateral decisions can suspend frontier model access overnight, the architecture of independence is not idealism. It is survival infrastructure.

→ See [docs/p2c-pledge.md](docs/p2c-pledge.md) for the full policy commitment and addendum.

---

## License

| Use | License |
|-----|----------|
| Personal / research / education | ✅ Free + attribution |
| Open-source implementation | ✅ Free + attribution + same license |
| Internal enterprise | ✅ Free + attribution |
| `@avant-dev/akp-core` TypeScript interfaces | ✅ MIT sublicense |
| Managed service / SaaS | ❌ Commercial License required |

→ [licensing@avant.dev](mailto:licensing@avant.dev) · See [LICENSE](LICENSE) for full terms.

---

**Designed and authored by Erick González Aguilar**  
[Avant.Dev](https://avant.dev) · Mexico City · [ITU P2C Pledge #7528](docs/p2c-pledge.md)  
© 2026 Erick González Aguilar. All rights reserved.
