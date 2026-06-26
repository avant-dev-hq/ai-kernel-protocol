# Quickstart: Your First AKP Kernel

## 1. Install

```bash
npm install ai @ai-sdk/anthropic @ai-sdk/openai express cors pg pgvector zod dotenv
```

## 2. Configure

```bash
# .env — one line changes everything
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
AI_EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
KERNEL_API_KEY=your-secret
CORS_ORIGINS=http://localhost:3000
```

## 3. Migrate

```bash
npm run db:migrate
```

## 4. Verify

```bash
curl http://localhost:3000/health
# {"status":"ok","provider":"anthropic","embedding_provider":"openai"}

curl http://localhost:3000/health/providers
# {"anthropic":{"status":"ok","latency_ms":220},...}
```

## 5. Chat

```bash
curl -X POST http://localhost:3000/chat \
  -H "Authorization: Bearer your-secret" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello AKP!"}],"stream":false}'
```

## 6. Switch Providers

```bash
# .env: change ONE line
AI_PROVIDER=mistral
MISTRAL_API_KEY=...
# Restart. Same behavior. Different provider. H₂O.
```
