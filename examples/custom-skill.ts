/**
 * Custom AKP Skill — Example
 * AI Kernel Protocol v0.1.0
 * Works identically with Claude, Mistral, Deepseek, or OpenAI.
 */
import { z } from 'zod';
import type { IAKPSkill, AKPContext } from '@avant-dev/akp-core';

export const exampleSkill: IAKPSkill = {
  name: 'query_my_data',
  description: 'Search my custom database. Use for internal data questions.',
  parameters: z.object({
    search: z.string().describe('Keyword to search'),
    limit:  z.number().int().min(1).max(25).optional().describe('Max results'),
  }),
  execute: async (params, _context?: AKPContext) => {
    const { search, limit = 10 } = params as { search: string; limit?: number };
    // Replace with your DB query:
    // const rows = await db.query(`SELECT ... WHERE ... ILIKE $1 LIMIT $2`, [`%${search}%`, limit]);
    const rows: Array<{ id: number; title: string; summary: string }> = [];
    if (!rows.length) return 'No matching records found.';
    return rows.map(r => `• [${r.id}] ${r.title}\n  ${r.summary}`).join('\n');
  },
};
