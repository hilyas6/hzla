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
- `src/app/api/auth/signup/route.ts` — Creates a user (hashed password via bcryptjs), emails a verification code via `issueOtp`. Rate limited per IP.
- `src/app/api/auth/verify-email/route.ts` — Confirms the signup code, sets `email_verified = true`. Rate limited per IP.
- `src/app/api/auth/login-init/route.ts` — Verifies email+password, then tells the client what's next: `"verify-email"` (unverified account, code just sent), `"otp"` (2FA account, code just sent), or `"none"` (go straight to `signIn`). Rate limited per IP.
- `src/app/api/admin/users/route.ts` — GET, lists all users (admin only).
- `src/app/api/admin/users/[id]/route.ts` — PATCH (change role), DELETE (remove user); admin only, can't act on your own account for delete.
- `src/app/api/account/two-factor/route.ts` — PATCH, toggles `two_factor_enabled` on the logged-in user's own account.

### Auth
- **Signup requires email verification; login is password-only by default.** `two_factor_enabled` (off by default, toggled from the dashboard) is what makes login also require an emailed code — both cases reuse the same `otp_code_hash`/`otp_expires_at` columns and `src/lib/otp.ts` helpers (`issueOtp`, `isOtpValid`).
- `src/auth.ts` — Auth.js config: Credentials provider always checks email+password; only demands a valid `otp` when `!user.email_verified || user.two_factor_enabled`. `id`/`role` carried through the JWT/session.
- Login is two-step client side (`src/app/login/login-client.tsx`): submit email/password → `/api/auth/login-init` decides if a code is needed → if so, submit it alongside the original credentials via `signIn("credentials", ...)`. Signup (`src/app/signup/signup-client.tsx`) verifies the code inline, then signs in automatically.
- `src/lib/email.ts` — `sendOtpEmail` via Resend's HTTP API (`RESEND_API_KEY`/`RESEND_FROM_EMAIL`), same `fetch`-based pattern as the Groq call in the detector route.
- `src/lib/rate-limit.ts` — in-memory per-IP sliding window (`isRateLimited`); ponytail-flagged as single-process only, fine for one container.
- `src/lib/db.ts` — `pg.Pool` singleton (`DATABASE_URL`).
- `src/lib/schema.sql` — `users` table DDL (id, email, password_hash, role, created_at, otp_code_hash, otp_expires_at, email_verified, two_factor_enabled). Applied via Postgres container init on first boot only — for an already-running DB, migrate manually (see below).
- `src/middleware.ts` — requires login for `/dashboard`, `/tools/fake-job-detector`, `/api/detector`, `/api/account/*`; requires `role === 'admin'` for `/api/admin/*`; rate-limits `/api/auth/callback/credentials` (the actual password check) independent of `login-init`, since that endpoint could be hit directly. `/dashboard` branches by role — admins see `AdminPanel` (user management), everyone gets the `TwoFactorToggle`.

**Migrating an existing deployment's DB** (schema.sql only runs on first container boot):
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;
-- existing accounts predate email verification — grandfather them in:
UPDATE users SET email_verified = true;
```

### Components
- `src/components/navbar.tsx`, `footer.tsx`, `tool-card.tsx` — Shared layout. Navbar shows a profile icon → `/dashboard` when logged in, Sign Up/Log In buttons otherwise. `ToolCard` has a `locked` status (dim, links to `/signup`) for auth-gated tools viewed while logged out.
- `src/components/providers.tsx` — wraps the app in Auth.js `SessionProvider`
- `src/components/ui/` — shadcn/ui primitives (button, card, badge, tabs, input, textarea, switch, etc.) built on `@base-ui/react` — use the `render` prop (not `asChild`) to polymorphically render as another element, e.g. `<Button render={<Link href="/x" />}>`.

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
