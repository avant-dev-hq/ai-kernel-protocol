# AKP Skills Primitive Specification
**Version:** 0.1.0 · **Section:** 6 of SPEC.md

## Skill Interface

```typescript
interface IAKPSkill {
  name: string;               // snake_case, unique in registry
  description: string;        // Natural language — passed to model
  parameters: ZodSchema;      // Validation + JSON Schema generation
  execute(params: unknown, context?: AKPContext): Promise<string>;
}
```

## Context Injection

```typescript
interface AKPContext {
  session_id?: string; user_id?: string; org_id?: number;
  provider: AKPProvider; tier: 'fast' | 'standard' | 'advanced';
}
```

## MCP Bridge

AKP → MCP mapping:
```
IAKPSkill.name        → MCP Tool.name
IAKPSkill.description → MCP Tool.description
IAKPSkill.parameters  → MCP Tool.inputSchema (Zod → JSON Schema)
IAKPSkill.execute()   → MCP CallTool handler
```

## Naming Conventions
- Names MUST be `snake_case`, unique in registry
- SHOULD be prefixed: `query_*`, `create_*`, `analyze_*`
