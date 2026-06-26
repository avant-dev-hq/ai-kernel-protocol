/**
 * Custom AKP Skill — Example
 * AI Kernel Protocol v0.1.0
 *
 * Shows how to define a provider-agnostic skill.
 * Works identically with Claude, Mistral, Deepseek, or OpenAI.
 */

import { z } from 'zod';
import type { IAKPSkill, AKPContext } from '@avant-dev/akp-core';

/**
 * Example: A skill that queries a custom database table.
 * Register this in any AKP-compliant kernel — zero provider-specific code.
 */
export const exampleSkill: IAKPSkill = {
  name: 'query_my_data',
  description:
    'Search my custom database for records matching the query. Use for internal data questions.',

  parameters: z.object({
    search: z.string().describe('Keyword to search for'),
    limit:  z.number().int().min(1).max(25).optional().describe('Max results, default 10'),
  }),

  execute: async (params, _context?: AKPContext) => {
    const { search, limit = 10 } = params as { search: string; limit?: number };

    // Replace with your actual database query:
    // const results = await db.query(
    //   `SELECT id, title, summary FROM my_table
    //    WHERE title ILIKE $1 OR content ILIKE $1
    //    LIMIT $2`,
    //   [`%${search}%`, limit]
    // );
    const results: Array<{ id: number; title: string; summary: string }> = [];

    if (!results.length) return 'No matching records found.';
    return results.map(r => `• [${r.id}] ${r.title}\n  ${r.summary}`).join('\n');
  },
};
