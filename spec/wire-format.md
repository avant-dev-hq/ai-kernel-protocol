# AKP Wire Format Specification
**Version:** 0.1.0 · **Section:** 7 of SPEC.md

## Chat Request

```http
POST /chat
Authorization: Bearer <KERNEL_API_KEY>
Content-Type: application/json

{
  "messages": [{"role": "user", "content": "..."}],
  "tier": "standard",
  "tools": ["skill_name"],
  "session_id": "uuid",
  "stream": true,
  "max_steps": 5
}
```

## SSE Response

```http
Content-Type: text/event-stream
Cache-Control: no-cache
X-Accel-Buffering: no

data: {"type":"text","delta":"..."}
data: {"type":"tool_call","name":"skill"}
data: {"type":"tool_result","name":"skill"}
data: {"type":"done","usage":{"promptTokens":N,"completionTokens":N}}
data: {"type":"error","error":"..."}
```

## JSON Response (`stream: false`)

```json
{"text": "...", "usage": {"promptTokens": N, "completionTokens": N}, "finish_reason": "stop"}
```

## Error Format

```json
{"error": "Human-readable message"}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request |
| 401 | Unauthorized |
| 404 | Not found |
| 500 | Internal error |
| 503 | Provider unreachable |
