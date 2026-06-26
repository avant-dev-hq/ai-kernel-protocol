# AKP Documentation Site

Production documentation for the [AI Kernel Protocol (AKP)](https://akp.avant.dev) — built with [Mintlify](https://mintlify.com).

## Local Development

```bash
# Install the Mintlify CLI
npm install -g mintlify

# Start local dev server (from this directory)
mintlify dev
```

The docs will be available at `http://localhost:3000`.

## Project Structure

```
docs-site/
├── mint.json                   # Mintlify configuration
├── favicon.svg                 # Site favicon
├── logo/
│   ├── akp-light.svg           # Logo (light mode)
│   └── akp-dark.svg            # Logo (dark mode)
├── images/                     # Image assets
├── snippets/
│   └── footer.mdx              # Reusable attribution footer
└── pages/
    ├── introduction.mdx        # What is AKP, H2O principle
    ├── quickstart.mdx          # 5-minute quickstart
    ├── mcp-relationship.mdx    # AKP vs MCP
    ├── compliance.mdx          # AKP compliance certification
    ├── spec/
    │   ├── overview.mdx        # Specification overview
    │   ├── provider.mdx        # Provider abstraction primitive
    │   ├── memory.mdx          # Memory (H2O) primitive
    │   ├── rag.mdx             # RAG pipeline primitive
    │   ├── skills.mdx          # Skills registry primitive
    │   └── wire-format.mdx     # REST + SSE wire format
    ├── guides/
    │   ├── first-implementation.mdx
    │   ├── custom-skills.mdx
    │   ├── hybrid-rag.mdx
    │   └── ios-swift-client.mdx
    └── reference/
        ├── api.mdx             # Full REST API reference
        ├── typescript-sdk.mdx  # @avant-dev/akp-core reference
        └── environment-vars.mdx
```

## Deploy to Vercel

The Mintlify docs site is deployed through the Mintlify platform, which integrates directly with GitHub. However, if you're deploying a custom Next.js build:

### Option A: Mintlify Cloud (Recommended)

1. Sign up at [mintlify.com](https://mintlify.com)
2. Connect your GitHub repository
3. Set the docs directory to `docs-site/`
4. Mintlify automatically deploys on every push to `main`

**Custom domain:**
1. In the Mintlify dashboard, go to **Settings → Custom Domain**
2. Add your domain (e.g., `docs.akp.avant.dev`)
3. Create a CNAME record pointing to `custom.mintlify.dev`

### Option B: Vercel (Static export)

If you've converted this to a Next.js site:

```bash
# Install Vercel CLI
npm install -g vercel

# From the docs-site/ directory:
cd docs-site
vercel

# For production deployment:
vercel --prod
```

**Environment variables (Vercel dashboard):**

No environment variables are required for static documentation sites.

**`vercel.json` (if needed):**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "out",
  "framework": "nextjs"
}
```

### Option C: Railway

Railway can host Mintlify-based docs as a static site:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create a new project
railway init

# Deploy (from docs-site/ directory)
cd docs-site
railway up
```

**`railway.json`:**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npx mintlify dev --port $PORT",
    "healthcheckPath": "/",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Alternatively, serve static files with `serve`:**

```bash
# Generate static export first
npx mintlify build

# Then serve
npx serve dist --port $PORT
```

## Content Authoring

All documentation pages are MDX files in `pages/`. MDX supports:

- Standard Markdown syntax
- Mintlify components: `<Card>`, `<CardGroup>`, `<Steps>`, `<Tabs>`, `<Accordion>`, `<Note>`, `<Warning>`, `<Tip>`, `<Info>`
- Code blocks with syntax highlighting and copy button
- Mermaid diagrams (via code blocks with ` ```mermaid `)

### Adding a New Page

1. Create a new `.mdx` file in the appropriate `pages/` subdirectory
2. Add frontmatter:
   ```mdx
   ---
   title: "Page Title"
   description: "Short description for SEO"
   icon: "icon-name"  # See https://fontawesome.com/icons
   ---
   ```
3. Add the page path to `mint.json` under `navigation`
4. Include the attribution footer: `<Snippet file="footer.mdx" />`

### Attribution Footer

Every page must include the attribution footer at the bottom:

```mdx
<Snippet file="footer.mdx" />
```

This renders:

> AI Kernel Protocol — designed by **Erick González Aguilar** · Avant.Dev · Mexico City · ITU P2C #7528 | Licensed under Avant.Dev SAL v1.0

## Configuration Reference

`mint.json` controls all site configuration. Key fields:

| Field | Description |
|-------|-------------|
| `name` | Site name (appears in browser tab) |
| `logo` | Light/dark mode logo SVGs |
| `colors.primary` | Brand color (Indigo `#6366f1`) |
| `navigation` | Sidebar navigation structure |
| `tabs` | Top navigation tabs |
| `topbarCtaButton` | "Get Started" call-to-action button |
| `modeToggle.default` | Default color mode (`"dark"`) |
| `feedback` | Enable thumbs rating and GitHub edit links |

See the [Mintlify configuration reference](https://mintlify.com/docs/settings/global) for all options.

## License

AI Kernel Protocol documentation is part of the AKP project, licensed under the [Avant.Dev SAL v1.0](https://avant.dev/licenses/sal-v1).

---

*AI Kernel Protocol — designed by Erick González Aguilar · Avant.Dev · Mexico City · ITU P2C #7528*
