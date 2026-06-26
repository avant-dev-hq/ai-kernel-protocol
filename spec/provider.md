# AKP Provider Abstraction Specification

**Version:** 0.1.0 · **Section:** 3 of SPEC.md

## Overview

The Provider Abstraction primitive enables AKP implementations to serve any LLM provider through a single interface. The active provider is determined at runtime via `AI_PROVIDER`.

## Model Tier Resolution

| `AI_PROVIDER` | `fast` | `standard` | `advanced` |
|---|---|---|---|
| `anthropic` | `ANTHROPIC_MODEL_FAST` (claude-haiku-4-5) | `ANTHROPIC_MODEL_STANDARD` (claude-sonnet-4-5) | `ANTHROPIC_MODEL_ADVANCED` (claude-opus-4-5) |
| `mistral` | `MISTRAL_MODEL_FAST` (mistral-small-latest) | `MISTRAL_MODEL_STANDARD` (mistral-large-latest) | `MISTRAL_MODEL_ADVANCED` (mistral-large-latest) |
| `deepseek` | `DEEPSEEK_MODEL_FAST` (deepseek-chat) | `DEEPSEEK_MODEL_STANDARD` (deepseek-chat) | `DEEPSEEK_MODEL_ADVANCED` (deepseek-reasoner) |
| `openai` | `OPENAI_MODEL_FAST` (gpt-4o-mini) | `OPENAI_MODEL_STANDARD` (gpt-4o) | `OPENAI_MODEL_ADVANCED` (gpt-4o) |

## Embedding Independence

`AI_EMBEDDING_PROVIDER` configures embeddings separately from inference.

| `AI_EMBEDDING_PROVIDER` | Default Model | Dimensions |
|---|---|---|
| `openai` (default) | `text-embedding-3-small` | 1536 |
| `mistral` | `mistral-embed` | 1024 |

When switching embedding providers, the vector dimension changes. Implementations MUST use separate storage tables per dimension to prevent type errors.

## Full Environment Variable Reference

```bash
# Core
AI_PROVIDER=anthropic                    # anthropic|mistral|deepseek|openai

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL_FAST=claude-haiku-4-5
ANTHROPIC_MODEL_STANDARD=claude-sonnet-4-5
ANTHROPIC_MODEL_ADVANCED=claude-opus-4-5

# Mistral
MISTRAL_API_KEY=...
MISTRAL_MODEL_FAST=mistral-small-latest
MISTRAL_MODEL_STANDARD=mistral-large-latest
MISTRAL_MODEL_ADVANCED=mistral-large-latest

# Deepseek (OpenAI-compatible)
DEEPSEEK_API_KEY=...
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL_FAST=deepseek-chat
DEEPSEEK_MODEL_STANDARD=deepseek-chat
DEEPSEEK_MODEL_ADVANCED=deepseek-reasoner

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL_FAST=gpt-4o-mini
OPENAI_MODEL_STANDARD=gpt-4o
OPENAI_MODEL_ADVANCED=gpt-4o

# Embeddings
AI_EMBEDDING_PROVIDER=openai             # openai|mistral
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
MISTRAL_EMBEDDING_MODEL=mistral-embed
EMBEDDING_DIMENSIONS=1536               # 1536 (OpenAI) | 1024 (Mistral)
```
