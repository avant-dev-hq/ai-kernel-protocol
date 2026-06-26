/**
 * src/tools/index.ts
 * AI Kernel Protocol — generic tool registry.
 *
 * No built-in tools. This is intentional.
 * Tools are private business logic — implement them in ai-kernel-add-ons.
 *
 * How to add tools:
 *   1. Create src/tools/custom.ts (this file is gitignored)
 *   2. Export: export const ALL_TOOLS = { tool_name: tool({...}) }
 *   3. The server loads it automatically at boot
 */
import type { Tool } from 'ai';

/** Mutable registry. Populated at boot by add-ons via registerTools(). */
export const TOOL_REGISTRY: Record<string, Tool> = {};

/** Register tools from add-ons at boot time. */
export function registerTools(tools: Record<string, Tool>): void {
  Object.assign(TOOL_REGISTRY, tools);
}

/**
 * Returns a subset of registered tools by name.
 * Empty / undefined = returns ALL registered tools.
 */
export function buildTools(names?: string[]): Record<string, Tool> {
  if (!names?.length) return TOOL_REGISTRY;
  return Object.fromEntries(
    Object.entries(TOOL_REGISTRY).filter(([k]) => names.includes(k))
  );
}

/** Returns names of all currently registered tools. */
export function getToolNames(): string[] {
  return Object.keys(TOOL_REGISTRY);
}
