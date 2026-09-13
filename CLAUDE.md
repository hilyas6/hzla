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
- `src/app/api/auth/[...nextauth]/route.ts` — Auth.js (NextAuth v5) handlers. Credentials (email/password) login, JWT sessions.
- `src/app/api/auth/signup/route.ts` — Creates a user (hashed password via bcryptjs) in Postgres.
- `src/app/api/admin/users/route.ts` — GET, lists all users (admin only).
- `src/app/api/admin/users/[id]/route.ts` — PATCH (change role), DELETE (remove user); admin only, can't act on your own account for delete.
- `src/app/api/auth/request-otp/route.ts` — verifies email+password, emails a 6-digit code via Resend (`src/lib/email.ts`), stores its hash on the user row. Public (pre-session), rate limiting not implemented.

### Auth
- `src/auth.ts` — Auth.js config: Credentials provider requires email + password + `otp` together; `authorize()` re-checks the password and verifies the OTP hash/expiry, then clears it (single use). `id`/`role` carried through the JWT/session.
- Login is two-step client side (`src/app/login/login-client.tsx`): submit email/password → `/api/auth/request-otp` sends the code → submit code alongside the original credentials via `signIn("credentials", ...)`. Signup no longer auto-logs-in; it redirects to `/login` since a session now requires the OTP step.
- `src/lib/db.ts` — `pg.Pool` singleton (`DATABASE_URL`).
- `src/lib/schema.sql` — `users` table DDL (id, email, password_hash, role, created_at, otp_code_hash, otp_expires_at). Applied via Postgres container init on first boot only — for an already-running DB, migrate manually (see below).
- `src/middleware.ts` — requires login for `/dashboard`, `/tools/fake-job-detector`, `/api/detector`; requires `role === 'admin'` for `/api/admin/*`. `/dashboard` itself branches by role — admins see `AdminPanel` (user management), everyone else sees their tool access.

**Migrating an existing deployment's DB** (schema.sql only runs on first container boot):
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;
```

### Components
- `src/components/navbar.tsx`, `footer.tsx`, `tool-card.tsx` — Shared layout. Navbar shows a profile icon → `/dashboard` when logged in, Sign Up/Log In buttons otherwise. `ToolCard` has a `locked` status (dim, links to `/signup`) for auth-gated tools viewed while logged out.
- `src/components/providers.tsx` — wraps the app in Auth.js `SessionProvider`
- `src/components/ui/` — shadcn/ui primitives (button, card, badge, tabs, input, textarea, etc.) built on `@base-ui/react` — use the `render` prop (not `asChild`) to polymorphically render as another element, e.g. `<Button render={<Link href="/x" />}>`.

### Environment Variables
- `GROQ_API_KEY` — Groq API key
- `DATABASE_URL` — Postgres connection string
- `AUTH_SECRET` — Auth.js session signing secret (`openssl rand -base64 32`)
- `AUTH_TRUST_HOST` — must be `true` when self-hosting behind a reverse proxy/tunnel
- `AUTH_URL` — public URL of the site
- `RESEND_API_KEY` — Resend API key, used to send login 2FA emails
- `RESEND_FROM_EMAIL` — verified sender, e.g. `HZLA <noreply@hzla.uk>`

Set locally in `frontend/.env.local` (see `frontend/.env.example`), or via `.env` at the repo root for `docker compose`.

## Deployment

Self-hosted via Docker on a home server (CasaOS), not Cloudflare Pages — the login system needs a real Postgres connection, which Cloudflare's edge runtime can't hold over raw TCP without extra bridging.

`docker-compose.yml` at the repo root runs the app (`frontend/Dockerfile`, multi-stage build off `output: "standalone"`) alongside a `postgres:16-alpine` container. The app is exposed to the internet via a Cloudflare Tunnel pointed at the CasaOS box, so the domain still gets Cloudflare's SSL/CDN without opening any ports.

```bash
cp frontend/.env.example .env   # fill in DATABASE_URL, AUTH_SECRET, AUTH_URL, GROQ_API_KEY
docker compose up -d --build
```

## Adding a New Tool

1. Create `src/app/tools/<tool-name>/page.tsx` (server component with metadata)
2. Create a client component for the interactive UI
3. If the tool needs an API, create `src/app/api/<tool-name>/route.ts`
4. Add the tool to the grid in `src/app/page.tsx`
