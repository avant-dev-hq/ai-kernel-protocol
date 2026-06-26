# AKP and MCP: Understanding the Relationship

## They Are Not Competitors

AKP is explicitly built as a layer on top of MCP. Implementing AKP does not mean abandoning MCP. A well-built AKP kernel IS a first-class MCP server.

## What MCP Defines

- JSON-RPC message framing
- Transport (Streamable HTTP, stdio)
- Three primitives: Tools, Resources, Prompts
- Capability negotiation and lifecycle
- Authorization (OAuth 2.1 + PKCE)

MCP is intentionally minimal. It defines *how to connect*. It does not define how to make connections persistent, memory-enabled, or provider-agnostic.

## What AKP Adds

| Concern | MCP | AKP |
|---------|-----|-----|
| Tool/function calling | ✅ Tools | ✅ Skills = AKP Tools, exposed as MCP |
| External data | ✅ Resources | ✅ RAG (embed, search, hybrid) |
| Conversational memory | ❌ Not defined | ✅ Sessions + Messages |
| Provider abstraction | ❌ Provider-specific | ✅ H2O Principle |
| RAG observability | ❌ Not defined | ✅ Pipeline observations |
| Hybrid search | ❌ Not defined | ✅ BM25 + vector + RRF |

## The Integration Pattern

```typescript
// AKP kernel exposes skills as MCP tools
// → Claude Desktop, LibreChat, Cursor can call AKP skills via MCP

// AKP kernel consumes external MCP servers as skill sources
// → GitHub MCP + Slack MCP + your AKP skills = unified intelligence layer
```

## Positioning

- **MCP** answers: *How does an AI app connect to external tools?*
- **AKP** answers: *How does an AI app maintain memory, retrieve knowledge, and run skills — identically across any provider?*
