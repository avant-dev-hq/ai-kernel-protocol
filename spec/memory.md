# AKP Memory Primitive Specification

**Version:** 0.1.0 · **Section:** 4 of SPEC.md

## Overview

AKP Memory provides structured, durable persistence for conversational sessions and messages. Unlike MCP's stateless tool execution, AKP Memory is a first-class primitive that survives process restarts and enables multi-session, multi-device intelligence continuity.

## Data Model

```
Session
  id: UUID (assigned by implementation)
  user_id: string
  org_id?: number
  title?: string
  model_provider: string    # Provider at session creation
  model_name?: string
  system_prompt?: string    # Session-scoped system prompt
  metadata: object
  tags: string[]
  status: 'active' | 'archived' | 'deleted'
  created_at: ISO8601
  updated_at: ISO8601       # Updated on every message add

Message
  id: UUID
  session_id: UUID → Session (CASCADE DELETE)
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  tool_calls?: object
  tool_results?: object
  tokens_used?: number      # For cost tracking
  cost_cents?: number       # 4 decimal places
  model_used?: string
  created_at: ISO8601
```

## REST Endpoints

```
POST   /memory/sessions                Create session
GET    /memory/sessions?user_id=...    List sessions for user
GET    /memory/sessions/:id            Get session metadata
DELETE /memory/sessions/:id            Archive session
GET    /memory/sessions/:id/messages   Get message history
POST   /memory/sessions/:id/messages   Add message
```

## Context Window

`getContextWindow(sessionId, maxMessages)` MUST return the last `maxMessages` messages ordered chronologically (oldest first) — suitable for direct inclusion in a model's message array. Default: 50 messages.
