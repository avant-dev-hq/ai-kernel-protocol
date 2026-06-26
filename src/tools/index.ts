/**
 * Generic tool registry. No built-in tools — this is intentional.
 * Private tools live in ai-kernel-add-ons (private repo).
 * Copy src/tools/custom.ts from add-ons to load your tools.
 */
import type { Tool } from 'ai';

export const TOOL_REGISTRY: Record<string, Tool> = {};

export function registerTools(tools: Record<string, Tool>): void {
  Object.assign(TOOL_REGISTRY, tools);
}

export function buildTools(names?: string[]): Record<string, Tool> {
  if (!names?.length) return TOOL_REGISTRY;
  return Object.fromEntries(Object.entries(TOOL_REGISTRY).filter(([k]) => names.includes(k)));
}

export function getToolNames(): string[] {
  return Object.keys(TOOL_REGISTRY);
}
