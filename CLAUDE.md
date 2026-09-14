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
- `src/app/api/auth/forgot-password/route.ts` — POST `{ email }`, issues an OTP if the account exists. Always returns `{ ok: true }` either way (no account-existence leak). Rate limited per IP.
- `src/app/api/auth/reset-password/route.ts` — POST `{ email, code, newPassword }`, validates the OTP and sets a new `password_hash`. Rate limited per IP.
- `src/app/api/admin/users/route.ts` — GET, lists all users (admin only).
- `src/app/api/admin/users/[id]/route.ts` — PATCH (change role), DELETE (remove user); admin only, can't act on your own account for delete.
- `src/app/api/account/two-factor/route.ts` — PATCH, toggles `two_factor_enabled` on the logged-in user's own account.
- `src/app/api/account/notifications/route.ts` — PATCH, toggles `notify_security_email` (emailed on password change) on the logged-in user's own account.
- `src/app/api/account/profile/route.ts` — PATCH `{ name }`, updates the logged-in user's display name.
- `src/app/api/account/password/route.ts` — PATCH `{ currentPassword, newPassword }`, verifies the current password before updating it. Rate limited per user id.
- `src/app/api/account/route.ts` — DELETE `{ password }`, self-service account deletion after verifying the password. Rate limited per user id.
- `src/app/api/account/avatar/route.ts` — POST `{ image }` (a `data:image/jpeg;base64,...` string, already resized client-side to 256x256), writes it to `AVATAR_DIR` (see below) and stores the filename in `avatar_path`. DELETE removes the file and clears the column. Rate limited per user id.
- `src/app/api/avatar/[filename]/route.ts` — GET, streams an uploaded avatar back from `AVATAR_DIR`. Public (not behind auth) since avatars are meant to be viewable. Deliberately a Route Handler rather than a static file under `public/` — see the standalone-build note below.
- `src/app/api/account/me/route.ts` — GET, returns `{ avatarPath }` for the logged-in user. Exists purely so `Navbar` (a client component rendered from the root layout) can show the avatar without the root layout itself calling `auth()` — that would force every page in the app to render dynamically instead of statically (verified: adding `auth()` to `layout.tsx` flipped `/`, `/login`, `/signup`, etc. from `○ Static` to `ƒ Dynamic` in the build output). `Navbar` fetches this once on mount and again whenever `window` receives the `hzla:avatar-updated` event (dispatched by `ProfileForm` after an avatar upload/removal — see `src/lib/avatar-events.ts`).

### Auth
- **Signup requires email verification; login is password-only by default.** `two_factor_enabled` (off by default, toggled from the dashboard) is what makes login also require an emailed code — signup verification, login 2FA, and password reset all reuse the same `otp_code_hash`/`otp_expires_at` columns (one pending code per account) and `src/lib/otp.ts` helpers (`issueOtp`, `isOtpValid`).
- `src/auth.ts` — Auth.js config: Credentials provider always checks email+password; only demands a valid `otp` when `!user.email_verified || user.two_factor_enabled`. `id`/`role` carried through the JWT/session.
- Login is two-step client side (`src/app/login/login-client.tsx`): submit email/password → `/api/auth/login-init` decides if a code is needed → if so, submit it alongside the original credentials via `signIn("credentials", ...)`. Signup (`src/app/signup/signup-client.tsx`) verifies the code inline, then signs in automatically.
- **Forgot password** (`src/app/forgot-password/forgot-password-client.tsx`) is the same two-step shape: email → `/api/auth/forgot-password` issues a code → code + new password → `/api/auth/reset-password` validates it and updates `password_hash`.
- `src/lib/email.ts` — `sendOtpEmail` and `sendPasswordChangedEmail` via Resend's HTTP API (`RESEND_API_KEY`/`RESEND_FROM_EMAIL`), same `fetch`-based pattern as the Groq call in the detector route. The password-changed email is best-effort (wrapped in try/catch at the call site) since a delivery failure shouldn't undo a password change that already succeeded, and only fires when `notify_security_email` is on.
- `src/lib/rate-limit.ts` — in-memory per-IP (or per-user-id for authenticated routes) sliding window (`isRateLimited`); ponytail-flagged as single-process only, fine for one container.
- `src/lib/db.ts` — `pg.Pool` singleton (`DATABASE_URL`).
- `src/lib/schema.sql` — `users` and `audit_log` table DDL (users: id, email, password_hash, role, created_at, otp_code_hash, otp_expires_at, email_verified, two_factor_enabled, name, notify_security_email, avatar_path). Applied via Postgres container init on first boot only — for an already-running DB, migrate manually (see below).
- `src/lib/validate.ts` — `parseRequest(request, zodSchema)` parses + validates a JSON body in one call, used by every mutating API route instead of hand-rolled `typeof` checks.
- `src/lib/audit-log.ts` — `logAudit({ userId, action, targetId?, ip?, metadata? })`, a best-effort insert into `audit_log`. Called from every sensitive mutation (login, signup, password change/reset, account deletion, 2FA toggle, admin role change/user delete) — never awaited in a way that can undo the action it's logging.
- `src/middleware.ts` — requires login for `/dashboard`, `/tools/fake-job-detector`, `/api/detector`, `/api/account/*`; requires `role === 'admin'` for `/api/admin/*`; rate-limits `/api/auth/callback/credentials` (the actual password check) independent of `login-init`, since that endpoint could be hit directly. `/dashboard` is the account hub: admins see `AdminPanel` (user management), everyone gets `ProfileForm` (display name + avatar), `ChangePasswordForm`, `SecuritySettings` (2FA + security-email toggles), and `DeleteAccount` (self-service, password-gated).
- **Avatars** are files, not DB blobs — `src/lib/resize-image.ts` downscales/crops client-side to a 256x256 JPEG before upload, `api/account/avatar` writes it to `AVATAR_DIR` (`src/lib/avatar-storage.ts`, deterministic `<user-id>.jpg` filename, so re-uploading just overwrites — no orphan cleanup needed). **Deliberately not stored under `public/`**: `output: "standalone"` traces the public directory at build time, so files written there at runtime aren't reliably served without a server restart (hit this in production — a freshly uploaded avatar 404'd until `docker compose restart app`). Storage lives at `uploads/avatars` instead and is served exclusively through `api/avatar/[filename]/route.ts`, which reads the file per-request — Route Handlers have no such build-time tracing, so this can't regress the same way. In Docker, `uploads/avatars` is a named volume (`hzla-avatars-data`, see `docker-compose.yml`) mounted at `/app/uploads/avatars` so uploads survive rebuilds/redeploys.

**Migrating an existing deployment's DB** (schema.sql only runs on first container boot):
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_security_email BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_path TEXT;
-- existing accounts predate email verification — grandfather them in:
UPDATE users SET email_verified = true;

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_id UUID,
  ip TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
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
