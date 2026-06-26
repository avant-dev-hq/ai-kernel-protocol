# Introduction to AI Kernel Protocol

## What is AKP?

The AI Kernel Protocol (AKP) is an open specification for a **provider-agnostic intelligence layer** built on top of the Model Context Protocol (MCP).

AKP answers a question MCP deliberately does not: *How do you build persistent, observable, memory-enabled AI intelligence that works identically across every major LLM provider?*

## The Three Gaps MCP Leaves Open

**1. Provider lock-in at the intelligence layer**  
MCP standardized connectivity. But every production AI system still hardcodes a provider. Swapping Claude for Mistral means rewriting your inference layer.

**2. No standard for conversational memory**  
MCP tools are stateless. There is no standard interface for durable, session-based conversational memory.

**3. RAG without quality guarantees**  
RAG exists everywhere, implemented differently everywhere. Silent retrieval failures corrupt every response downstream — most systems have no way to detect this.

## The H2O Principle

> Water is H₂O — always. Whether from a mountain spring, a bottle, or a tap.

AKP defines the molecule. Your application calls one interface. The provider is a configuration detail, not a code dependency.

## How AKP Relates to MCP

```
Your Application
       ↓
AKP — Memory · RAG · Skills · Provider Abstraction
       ↓
MCP — Tools · Resources · Prompts
       ↓
LLM Provider
```

AKP does not compete with MCP. It extends it. AKP Skills expose themselves as MCP tools, consumable by Claude Desktop, LibreChat, Cursor, and any MCP client.

## Who Built This

AKP was designed by **Erick González Aguilar**, Founder & Executive Director of [Avant.Dev](https://avant.dev) (Mexico City), in support of [ITU Partner2Connect Pledge #7528](https://www.itu.int/partner2connect/) — active in Mexico, Colombia, Brazil, Argentina, Chile, Peru, Ecuador, Costa Rica, Dominican Republic, and Panama.

For practitioners in these countries, provider agnosticism is not a technical preference — it is a requirement for sovereign, cost-effective, and resilient AI operations.

## Next Steps

- Read the [full specification](../SPEC.md)
- Browse the [core interfaces](../packages/akp-core/src/index.ts)
- Study the [examples](../examples/)
