# HZLA

**AI-powered tools for job seekers.** HZLA is a modern web platform that bundles a growing set of tools to help people navigate the job hunt — starting with an AI-powered **Fake Job Detector** that analyses postings for scam and fraud signals.

Built as a single Next.js app with Postgres-backed accounts, self-hosted with Docker.

---

## Features

### 🔐 Accounts
- Email/password signup with email verification (a 6-digit code is emailed before the account is usable)
- Password-only login by default; users can opt into **Two-Step Verification** from their dashboard, which emails a login code on every sign-in after that
- Roles: regular users and admins. Admins get a user-management panel (view, promote/demote, delete accounts) in the dashboard
- Per-IP rate limiting on signup, login, and code verification

### 🕵️ Fake Job Detector
Paste a job title and description and get an instant, structured fraud analysis powered by an LLM (Groq). Requires an account. Returns:

- **Verdict & risk score** — likely fraudulent vs. legitimate, with a 0–100% risk gauge
- **Confidence rating** — High / Medium / Low with reasoning
- **Fraud & legitimacy signals** — weighted by impact, with explanations
- **Categorised patterns** — e.g. urgency/pressure language, suspicious contact methods, inflated pay
- **Structural checklist** — company name, salary, application URL, contact domain, title specificity, description length
- **Plain-English summary** — a non-technical explanation of the verdict

> ⚠️ **Disclaimer:** Results are an automated AI estimate, not a definitive verdict. Always verify job postings independently.

More tools (application tracker, auto-filler, etc.) are planned — shown as locked/coming-soon on the landing page until they ship.

---

## Tech Stack

- **[Next.js 15](https://nextjs.org/)** (App Router) + **React 19** + **TypeScript**
- **[Tailwind CSS v4](https://tailwindcss.com/)** and **[shadcn/ui](https://ui.shadcn.com/)** (on [Base UI](https://base-ui.com/)) components
- **[Auth.js v5](https://authjs.dev/)** — Credentials provider, JWT sessions
- **[Postgres](https://www.postgresql.org/)** via `pg`, no ORM
- **[Resend](https://resend.com/)** for transactional email (signup verification, login 2FA codes)
- **[Groq](https://groq.com/)** LLM API (`openai/gpt-oss-120b`) for the detector
- **Docker Compose** — app + Postgres containers, self-hosted

---

## Getting Started

### Prerequisites
- Node.js 18+
- A local or remote Postgres instance
- A [Groq API key](https://console.groq.com/keys)
- A [Resend API key](https://resend.com/) and a verified sending domain

### Setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Fill in `frontend/.env.local`:

```bash
GROQ_API_KEY=gsk_your_key_here
DATABASE_URL=postgres://user:pass@localhost:5432/hzla
AUTH_SECRET=   # openssl rand -base64 32
AUTH_TRUST_HOST=true
AUTH_URL=http://localhost:3000
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=HZLA <noreply@yourdomain.com>
```

Apply the schema (`frontend/src/lib/schema.sql`) to your Postgres database, then:

```bash
npm run dev      # dev server on http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx                          # Landing page (hero + tool grid)
│   │   ├── login/, signup/                    # Auth pages + client forms
│   │   ├── dashboard/                         # Role-branched dashboard (admin panel / user panel), 2FA toggle
│   │   ├── tools/fake-job-detector/           # The detector tool (auth-gated)
│   │   └── api/
│   │       ├── detector/route.ts              # Calls Groq, returns structured JSON
│   │       ├── auth/                          # signup, login-init, verify-email, [...nextauth]
│   │       ├── admin/users/                   # Admin-only user management
│   │       └── account/two-factor/            # Self-service 2FA toggle
│   ├── auth.ts                                # Auth.js config
│   ├── middleware.ts                          # Route gating + rate limiting
│   ├── lib/                                   # db, email, otp, rate-limit, schema.sql
│   └── components/
│       ├── navbar.tsx, footer.tsx, tool-card.tsx
│       └── ui/                                # shadcn/ui primitives
├── Dockerfile
└── ...
docker-compose.yml                             # app + postgres, for self-hosting
```

### Environment Variables

| Variable              | Description                                                        |
| ---------------------- | -------------------------------------------------------------------- |
| `GROQ_API_KEY`          | Groq API key, used by the detector                                   |
| `DATABASE_URL`          | Postgres connection string                                          |
| `AUTH_SECRET`           | Auth.js session signing secret (`openssl rand -base64 32`)          |
| `AUTH_TRUST_HOST`       | Set `true` when self-hosting behind a reverse proxy/tunnel          |
| `AUTH_URL`              | Public URL of the site                                              |
| `RESEND_API_KEY`        | Resend API key, used to email verification/2FA codes                |
| `RESEND_FROM_EMAIL`     | Verified sender, e.g. `HZLA <noreply@yourdomain.com>`                |

---

## Deployment

Self-hosted via Docker — the app and Postgres run as containers on the same machine, exposed to the internet through a [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) pointed at that machine. This avoids opening any router ports while still getting Cloudflare's SSL/CDN in front of the domain.

```bash
cp frontend/.env.example .env   # fill in DATABASE_URL, AUTH_SECRET, AUTH_URL, GROQ_API_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL
docker compose up -d --build
```

`docker-compose.yml` builds the app from `frontend/Dockerfile` (multi-stage, off Next's `output: "standalone"`) and runs a `postgres:16-alpine` container alongside it; `frontend/src/lib/schema.sql` is applied automatically on the Postgres container's first boot.

---

## Adding a New Tool

1. Create `src/app/tools/<tool-name>/page.tsx` (server component with metadata).
2. Create a client component for the interactive UI.
3. If the tool needs an API, add `src/app/api/<tool-name>/route.ts`.
4. Add the tool to the grid in `src/app/page.tsx`.

---

## License

Released under the [MIT License](./LICENSE).
