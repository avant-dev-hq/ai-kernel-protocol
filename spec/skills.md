# AKP Skills Primitive Specification

**Version:** 0.1.0 · **Section:** 6 of SPEC.md

## Skill Interface

```typescript
interface IAKPSkill {
  name: string;               // snake_case, unique in registry
  description: string;        // Natural language — passed to model
  parameters: ZodSchema;      // Input validation + JSON Schema generation
  execute(
    params: unknown,
    context?: AKPContext       // Injected by kernel at call time
  ): Promise<string>;         // Always returns string (model-readable)
}
```

## Skill Registry

```typescript
interface IAKPSkillRegistry {
  register(skill: IAKPSkill): void;
  get(name: string): IAKPSkill | undefined;
  list(): IAKPSkill[];
  resolve(names?: string[]): IAKPSkill[];  // Empty = all skills
}
```

## MCP Bridge

AKP Skills → MCP Tools mapping:

```
IAKPSkill.name        → MCP Tool.name
IAKPSkill.description → MCP Tool.description
IAKPSkill.parameters  → MCP Tool.inputSchema (Zod → JSON Schema)
IAKPSkill.execute()   → MCP CallTool handler
```

This allows Claude Desktop, LibreChat, Cursor, VS Code — any MCP client — to invoke AKP skills without custom integration.

## Context Injection

```typescript
interface AKPContext {
  session_id?: string;
  user_id?: string;
  org_id?: number;
  provider: AKPProvider;
  tier: 'fast' | 'standard' | 'advanced';
}
```

## Naming Conventions

- Names MUST be `snake_case`
- SHOULD be prefixed with domain: `query_*`, `create_*`, `analyze_*`
- MUST be unique within a registry
