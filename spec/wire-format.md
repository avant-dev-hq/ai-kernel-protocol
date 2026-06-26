# AKP Wire Format Specification

**Version:** 0.1.0 · **Section:** 7 of SPEC.md

## Chat Request

```http
POST /chat
Authorization: Bearer <KERNEL_API_KEY>
Content-Type: application/json
```

```json
{
  "messages": [{"role": "user", "content": "What are the latest signals?"}],
  "tier": "standard",
  "provider": "anthropic",
  "tools": ["query_policy_intelligence"],
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "stream": true,
  "max_steps": 5,
  "system": "Optional system prompt override"
}
```

**Fields:**
- `messages` — REQUIRED, min 1
- `tier` — OPTIONAL, default `standard`
- `provider` — OPTIONAL, overrides `AI_PROVIDER` for this request
- `tools` — OPTIONAL, empty/omit to enable all skills
- `session_id` — OPTIONAL, enables memory persistence
- `stream` — OPTIONAL, default `true`
- `max_steps` — OPTIONAL, default `5`

## SSE Response (`stream: true`)

```http
Content-Type: text/event-stream
Cache-Control: no-cache
X-Accel-Buffering: no
```

```
data: {"type":"text","delta":"Based on current signals..."}
data: {"type":"tool_call","name":"query_policy_intelligence"}
data: {"type":"tool_result","name":"query_policy_intelligence"}
data: {"type":"done","usage":{"promptTokens":1240,"completionTokens":387}}
```

On error:
```
data: {"type":"error","error":"Rate limit exceeded"}
```

## JSON Response (`stream: false`)

```json
{
  "text": "Based on current policy signals...",
  "usage": {"promptTokens": 1240, "completionTokens": 387},
  "finish_reason": "stop",
  "tool_results": []
}
```

## Error Format

```json
{"error": "Human-readable error message"}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request (missing required field) |
| 401 | Unauthorized |
| 404 | Not found |
| 500 | Internal server error |
| 503 | Provider unreachable |
