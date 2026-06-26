# AKP and MCP: The Relationship

## Not Competitors — Layers

```
Your Application
       ↓
AKP — Memory · RAG · Skills · Provider Abstraction
       ↓
MCP — Tools · Resources · Prompts
       ↓
LLM Provider
```

## What MCP Defines (does not change)
- JSON-RPC framing, Streamable HTTP/stdio transport
- Tools, Resources, Prompts primitives
- Capability negotiation, OAuth 2.1 auth

## What AKP Adds

| Concern | MCP | AKP |
|---------|-----|-----|
| Conversational memory | ❌ | ✅ Sessions + Messages |
| Provider abstraction | ❌ | ✅ H2O Principle |
| RAG observability | ❌ | ✅ Pipeline observations |
| Hybrid search | ❌ | ✅ BM25 + vector + RRF |
| Skills as MCP tools | N/A | ✅ Direct bridge |

## Integration Pattern

```typescript
// AKP kernel exposes skills as MCP tools
// → Claude Desktop, LibreChat, Cursor can call AKP skills via MCP protocol

// AKP kernel consumes external MCP servers as skill sources
// → GitHub MCP + Slack MCP + your AKP skills = unified intelligence layer
```
