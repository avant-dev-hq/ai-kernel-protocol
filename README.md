# AI Kernel Protocol (AKP)

> The open protocol for composable AI infrastructure — Memory, RAG, Skills, and Provider abstraction built on top of MCP.

[![AKP Specification](https://img.shields.io/badge/spec-v0.1.0-6366f1)](https://akp.avant.dev/pages/spec/overview)
[![License: Avant.Dev SAL v1.0](https://img.shields.io/badge/license-Avant.Dev%20SAL%20v1.0-blue)](https://avant.dev/licenses/sal-v1)
[![Built by Avant.Dev](https://img.shields.io/badge/built%20by-Avant.Dev-indigo)](https://avant.dev)
[![ITU P2C Pledge #7528](https://img.shields.io/badge/ITU%20P2C-%237528-green)](https://www.itu.int/en/ITU-D/ICT-Infrastructure/Pages/p2c.aspx)

## What is AKP?

The **AI Kernel Protocol (AKP)** is an open, provider-agnostic infrastructure protocol that defines how AI systems store memory, retrieve knowledge, execute skills, and route between LLM providers — all through a composable, wire-compatible interface.

AKP sits _on top of_ the [Model Context Protocol (MCP)](https://modelcontextprotocol.io) and exposes MCP-compatible endpoints, so AKP kernels work with any MCP host (Claude Desktop, Cursor, Zed) out of the box.

## Four Primitives

| Primitive | Description |
|-----------|-------------|
| **Provider** | Unified LLM interface with fallback routing across Anthropic, OpenAI, Mistral, DeepSeek |
| **Memory (H2O)** | Tiered memory: Hot (RAM) → Warm (Redis) → Cold (PostgreSQL) with automatic promotion |
| **RAG** | Typed pipeline: chunk → embed → index → retrieve → rerank, portable across vector stores |
| **Skills** | Versioned, composable AI capabilities with streaming and structured outputs |

## Documentation

📖 **[akp.avant.dev](https://akp.avant.dev)** — Full documentation site

| Section | Description |
|---------|-------------|
| [Introduction](https://akp.avant.dev/pages/introduction) | What is AKP, the H2O principle |
| [Quickstart](https://akp.avant.dev/pages/quickstart) | Deploy a kernel in 5 minutes |
| [AKP vs MCP](https://akp.avant.dev/pages/mcp-relationship) | Layer diagram and relationship |
| [Specification](https://akp.avant.dev/pages/spec/overview) | Full spec: Provider, Memory, RAG, Skills, Wire Format |
| [Guides](https://akp.avant.dev/pages/guides/first-implementation) | Implementation guides including iOS/Swift |
| [API Reference](https://akp.avant.dev/pages/reference/api) | Full REST API reference |
| [Compliance](https://akp.avant.dev/pages/compliance) | How to certify AKP compliance |

## Quick Example

```bash
npm install @avant-dev/akp-core
```

```typescript
import { createKernel } from "@avant-dev/akp-core";

const kernel = createKernel({
  providers: {
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY! },
    openai: { apiKey: process.env.OPENAI_API_KEY! },
  },
  memory: {
    warm: { adapter: "redis", url: process.env.REDIS_URL! },
    cold: { adapter: "postgres", url: process.env.DATABASE_URL! },
  },
  mcp: { enabled: true },  // Expose as MCP server automatically
});

// Complete with automatic fallback
const response = await kernel.provider.complete({
  messages: [{ role: "user", content: "What is the capital of Mexico?" }],
});

// H2O memory
await kernel.memory.write({
  tier: "warm",
  key: "user:42:context",
  value: { topic: "geography" },
  ttl: 3600,
});

// RAG
const results = await kernel.rag.search({ query: "AKP memory tiers" });
```

## Repository Structure

```
ai-kernel-protocol/
├── README.md               # This file
└── docs-site/              # Documentation website (Mintlify)
    ├── mint.json           # Mintlify configuration
    ├── pages/              # All documentation pages (MDX)
    │   ├── introduction.mdx
    │   ├── quickstart.mdx
    │   ├── mcp-relationship.mdx
    │   ├── compliance.mdx
    │   ├── spec/           # Specification pages
    │   ├── guides/         # How-to guides
    │   └── reference/      # API and SDK reference
    └── README.md           # Docs site deployment instructions
```

## License

Licensed under the **Avant.Dev Source-Available License v1.0**. See [avant.dev/licenses/sal-v1](https://avant.dev/licenses/sal-v1).

---

*Designed by **Erick González Aguilar** · [Avant.Dev](https://avant.dev) · Mexico City*  
*UN ITU Partner2Connect Digital Pledge #7528 — covering Mexico, Colombia, Brazil, Argentina, Chile, Peru, Ecuador, Costa Rica, Dominican Republic, and Panama*
