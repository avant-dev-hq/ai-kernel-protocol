# Quickstart: Deploy Your First AKP Kernel

This guide deploys an AKP-compliant kernel in 5 minutes using the Avant.Dev reference implementation pattern.

## Prerequisites

- Node.js 20+
- PostgreSQL with pgvector extension
- API key for at least one provider (Anthropic, OpenAI, Mistral, or Deepseek)

## Step 1: Clone and Install

```bash
# The reference implementation pattern
mkdir my-akp-kernel && cd my-akp-kernel
npm init -y
npm install ai @ai-sdk/anthropic @ai-sdk/openai express cors pg pgvector zod dotenv
npm install -D typescript tsx @types/node @types/express @types/pg @types/cors
```

## Step 2: Configure

```bash
cp .env.example .env
```

Minimum `.env`:
```bash
# One line — change to switch all inference
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI required for embeddings (Anthropic has no embed API)
AI_EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=sk-...

# PostgreSQL with pgvector
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb

# Auth
KERNEL_API_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000
```

## Step 3: Run Migrations

```bash
npm run db:migrate
```

This creates the pgvector tables: `rag_documents`, `assistant_sessions`, `assistant_messages`, `skills`.

## Step 4: Start

```bash
npm run dev
```

## Step 5: Verify

```bash
curl http://localhost:3000/health
# {"status":"ok","provider":"anthropic","embedding_provider":"openai",...}

curl http://localhost:3000/health/providers
# {"anthropic":{"status":"ok","latency_ms":220},"openai":{"status":"ok","latency_ms":180},...}
```

## Step 6: Send Your First Request

```bash
curl -X POST http://localhost:3000/chat \
  -H "Authorization: Bearer your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello AKP!"}],"stream":false}'
# {"text":"Hello! I am your AKP-compliant kernel...","usage":{...}}
```

## Next: Switch Providers

```bash
# In .env — change ONE line:
AI_PROVIDER=mistral
MISTRAL_API_KEY=...

# Restart — same behavior, different provider:
npm run dev
```

H₂O. Same molecule.
