/**
 * src/index.ts
 * AI Kernel Protocol — Express server entry point.
 *
 * H2O principle: swap AI_PROVIDER env var → entire inference stack changes.
 * Add-ons: place src/tools/custom.ts (gitignored) to load private tools.
 *          See ai-kernel-add-ons (private repo) for implementation guide.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { registerTools, getToolNames } from './tools/index.js';
import healthRouter from './routes/health.js';
import chatRouter   from './routes/chat.js';
import ragRouter    from './routes/rag.js';
import memoryRouter from './routes/memory.js';
import type { Tool } from 'ai';

const app  = express();
const PORT = Number(process.env.PORT ?? 3000);
const KERNEL_API_KEY = process.env.KERNEL_API_KEY;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (process.env.CORS_ORIGINS ?? '').split(',').filter(Boolean),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ── Auth ──────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path.startsWith('/health')) return next();
  if (!KERNEL_API_KEY) return next();
  if (req.headers['authorization'] !== `Bearer ${KERNEL_API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/health', healthRouter);
app.use('/chat',   chatRouter);
app.use('/rag',    ragRouter);
app.use('/memory', memoryRouter);
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Boot ──────────────────────────────────────────────────────────────────────
async function boot() {
  // Load optional private add-on tools (gitignored — from ai-kernel-add-ons)
  try {
    const mod = await import('./tools/custom.js');
    if (mod?.ALL_TOOLS && typeof mod.ALL_TOOLS === 'object') {
      registerTools(mod.ALL_TOOLS as Record<string, Tool>);
      console.log(`[kernel] add-ons loaded: ${getToolNames().join(', ')}`);
    }
  } catch {
    console.log('[kernel] no add-ons — base capabilities only (chat · rag · memory)');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ai-kernel-protocol] :${PORT}`);
    console.log(`[ai-kernel-protocol] provider   = ${process.env.AI_PROVIDER ?? 'anthropic'}`);
    console.log(`[ai-kernel-protocol] embeddings = ${process.env.AI_EMBEDDING_PROVIDER ?? 'openai'}`);
    console.log(`[ai-kernel-protocol] tools      = ${getToolNames().length}`);
    if (!KERNEL_API_KEY) console.warn('[ai-kernel-protocol] WARNING: KERNEL_API_KEY not set — open access');
  });
}

boot().catch(err => {
  console.error('[ai-kernel-protocol] boot failed:', err);
  process.exit(1);
});
