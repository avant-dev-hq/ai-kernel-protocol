# AKP Memory Primitive Specification
**Version:** 0.1.0 · **Section:** 4 of SPEC.md

## Data Model

```
Session: id(UUID) · user_id · org_id? · title? · model_provider · model_name?
         system_prompt? · metadata(object) · tags(string[]) · status · timestamps

Message: id(UUID) · session_id(FK→Session, CASCADE) · role(user|assistant|system|tool)
         content · tool_calls? · tool_results? · tokens_used? · cost_cents? · model_used?
         created_at
```

## REST Endpoints

```
POST   /memory/sessions                Create session
GET    /memory/sessions?user_id=...    List sessions
GET    /memory/sessions/:id            Get session
DELETE /memory/sessions/:id            Archive session
GET    /memory/sessions/:id/messages   Message history
POST   /memory/sessions/:id/messages   Add message
```

## Context Window

`getContextWindow(sessionId, maxMessages=50)` returns last N messages, oldest first, suitable for direct model consumption.

Memory MUST be durable. In-memory-only = non-conformant.
