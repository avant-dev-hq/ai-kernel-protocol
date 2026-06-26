/**
 * Minimal AKP Provider — Example
 * AI Kernel Protocol v0.1.0
 *
 * Attribution: "Implements AI Kernel Protocol (AKP) — designed by Erick González Aguilar,
 * Avant.Dev · https://github.com/avant-dev-hq/ai-kernel-protocol"
 */
import type { AKPModelTier, AKPProvider } from '@avant-dev/akp-core';

export function getProvider(override?: string): AKPModelTier<unknown> {
  const provider = (override ?? process.env.AI_PROVIDER ?? 'anthropic') as AKPProvider;
  switch (provider) {
    case 'anthropic':
      return {
        fast:     { model: process.env.ANTHROPIC_MODEL_FAST     ?? 'claude-haiku-4-5' },
        standard: { model: process.env.ANTHROPIC_MODEL_STANDARD ?? 'claude-sonnet-4-5' },
        advanced: { model: process.env.ANTHROPIC_MODEL_ADVANCED ?? 'claude-opus-4-5' },
      };
    case 'mistral':
      return {
        fast:     { model: process.env.MISTRAL_MODEL_FAST     ?? 'mistral-small-latest' },
        standard: { model: process.env.MISTRAL_MODEL_STANDARD ?? 'mistral-large-latest' },
        advanced: { model: process.env.MISTRAL_MODEL_ADVANCED ?? 'mistral-large-latest' },
      };
    case 'deepseek': {
      const base = process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com/v1';
      return {
        fast:     { base, model: process.env.DEEPSEEK_MODEL_FAST     ?? 'deepseek-chat' },
        standard: { base, model: process.env.DEEPSEEK_MODEL_STANDARD ?? 'deepseek-chat' },
        advanced: { base, model: process.env.DEEPSEEK_MODEL_ADVANCED ?? 'deepseek-reasoner' },
      };
    }
    case 'openai':
      return {
        fast:     { model: process.env.OPENAI_MODEL_FAST     ?? 'gpt-4o-mini' },
        standard: { model: process.env.OPENAI_MODEL_STANDARD ?? 'gpt-4o' },
        advanced: { model: process.env.OPENAI_MODEL_ADVANCED ?? 'gpt-4o' },
      };
    default:
      throw new Error(`Unsupported AKP provider: "${provider}". Valid: anthropic|mistral|deepseek|openai`);
  }
}
