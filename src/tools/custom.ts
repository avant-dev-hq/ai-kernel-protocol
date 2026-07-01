// Optional add-on tools — loaded dynamically at runtime from ai-kernel-add-ons (gitignored).
// This stub allows TypeScript to resolve './tools/custom.js' during compilation.
// In production deployments with add-ons, this file is replaced by the actual implementation.
// Base deployment: exports an empty tool registry — no add-ons loaded.
import type { Tool } from 'ai';
export const ALL_TOOLS: Record<string, Tool> = {};
