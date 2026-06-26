# Introduction to AI Kernel Protocol

## What is AKP?

The AI Kernel Protocol (AKP) is an open specification for a **provider-agnostic intelligence layer** built on top of MCP.

AKP answers what MCP deliberately leaves open: *How do you build persistent, observable, memory-enabled AI intelligence that works identically across every major LLM provider?*

## The Three Gaps

1. **Provider lock-in** — hardcoded providers mean migration = rewrite
2. **Stateless intelligence** — MCP tools fire and forget, no durable memory
3. **RAG without quality** — no standard for retrieval observability, silent failures corrupt responses

## H2O Principle

Change `AI_PROVIDER`. That's it. Same RAG, same memory, same skills.

## AKP + MCP

```
Your App → AKP → MCP → LLM Provider
```

AKP Skills ARE MCP tools. Any MCP client (Claude Desktop, LibreChat, Cursor) can call AKP skills.

## Built By

**Erick González Aguilar** / [Avant.Dev](https://avant.dev) · Mexico City  
ITU P2C Pledge #7528 — Mexico · Colombia · Brazil · Argentina · Chile · Peru · Ecuador · Costa Rica · Dominican Republic · Panama
