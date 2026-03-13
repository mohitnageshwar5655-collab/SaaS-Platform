# AI SaaS Toolkit

## Overview

A full-stack SaaS-style AI Wrapper built with React + Vite (frontend) and Express 5 (backend). Uses Replit AI Integrations for OpenAI access (no user API key needed) and Replit Auth for user authentication.

## Features

- **Email Drafter** — Generate professional emails with tone/language selection
- **Blog & Social Media Posts** — Create optimized content for LinkedIn, Twitter/X, Instagram, Facebook
- **Code Generator** — Write, explain, and debug code in 10+ programming languages
- **Translator** — Translate text to any language using AI
- **AI Chat with Memory** — Full multi-turn conversation with persistent history
- **History** — Browse past generations saved to the database
- Multi-language support (English, Hindi, Spanish, French, German, Arabic, Chinese, Japanese, + more)

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/ai-saas)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Replit Auth (OpenID Connect / PKCE)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2 for general, streaming SSE)
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)

## Structure

```text
artifacts/
├── ai-saas/        # React + Vite frontend (SaaS app) [previewPath: /]
│   ├── src/pages/  # email, social, code, translate, chat, history, home pages
│   ├── src/hooks/  # use-ai-stream (SSE streaming hook)
│   └── src/components/
└── api-server/     # Express API backend [previewPath: /api]
    └── src/routes/
        ├── auth.ts    # Replit Auth OIDC routes
        ├── openai.ts  # Chat conversation routes
        └── tools.ts   # AI generation routes (email, blog, code, etc.)

lib/
├── api-spec/                      # OpenAPI spec + Orval codegen config
├── api-client-react/              # Generated React Query hooks
├── api-zod/                       # Generated Zod schemas
├── db/                            # Drizzle ORM schema + DB connection
│   └── src/schema/
│       ├── auth.ts                # Users + sessions tables
│       ├── conversations.ts       # AI chat conversations
│       ├── messages.ts            # Chat messages
│       └── generationHistory.ts  # Tool generation history
├── integrations-openai-ai-server/ # OpenAI server SDK client
├── integrations-openai-ai-react/  # OpenAI React hooks
└── replit-auth-web/               # Replit Auth browser hook
```

## API Routes

- `GET /api/healthz` — Health check
- `GET /api/auth/user` — Get current user
- `GET /api/login` — Start OIDC login
- `GET /api/logout` — Logout
- `GET /api/openai/conversations` — List chat conversations
- `POST /api/openai/conversations` — Create new conversation
- `GET /api/openai/conversations/:id` — Get conversation with messages
- `DELETE /api/openai/conversations/:id` — Delete conversation
- `POST /api/openai/conversations/:id/messages` — Send message (SSE streaming)
- `POST /api/tools/generate` — Generate AI content (SSE streaming)
- `GET /api/tools/history` — Get generation history

## Root Scripts

- `pnpm run build` — full typecheck + build
- `pnpm run typecheck` — runs `tsc --build`
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client + Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema
