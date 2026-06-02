# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HZLA** is an AI-powered job seeker platform with multiple tools (fake job detector, application tracker, auto-filler, etc.) behind a modern web interface. Built as a single Next.js app — no separate backend needed.

## Commands

```bash
cd frontend
npm install          # install dependencies
npm run dev          # dev server on http://localhost:3000
npm run build        # production build
npm run lint         # ESLint
```

Add shadcn components: `npx shadcn@latest add <component>`

## Architecture

Single Next.js 16 app (App Router) with TypeScript, Tailwind CSS v4, and shadcn/ui.

### Pages
- `src/app/page.tsx` — Landing page with hero + tool grid
- `src/app/tools/fake-job-detector/page.tsx` — Server component (metadata)
- `src/app/tools/fake-job-detector/detector-client.tsx` — Client component (form, results UI, API calls)

### API Routes
- `src/app/api/detector/route.ts` — POST endpoint that calls Groq (Llama 3.3 70B) to analyse job postings. Returns structured JSON: verdict, risk score, fraud/legit signals, categorised patterns, structural checklist, plain English summary. The API key is in `.env.local` (not committed).

### Components
- `src/components/navbar.tsx`, `footer.tsx`, `tool-card.tsx` — Shared layout
- `src/components/ui/` — shadcn/ui primitives (button, card, badge, tabs, input, textarea, etc.)

### Environment Variables
- `GROQ_API_KEY` — Groq API key (set in `.env.local` locally, or as secret on Cloudflare Pages)

## Deployment

Deploys to **Cloudflare Pages** (Next.js 15 with `@cloudflare/next-on-pages`). No separate backend needed — the Groq API is called from a Next.js edge route handler.

Set `GROQ_API_KEY` as a secret in Cloudflare Pages dashboard.

## Adding a New Tool

1. Create `src/app/tools/<tool-name>/page.tsx` (server component with metadata)
2. Create a client component for the interactive UI
3. If the tool needs an API, create `src/app/api/<tool-name>/route.ts`
4. Add the tool to the grid in `src/app/page.tsx`
