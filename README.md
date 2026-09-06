# HZLA

**AI-powered tools for job seekers.** HZLA is a modern web platform that bundles a growing set of tools to help people navigate the job hunt — starting with an AI-powered **Fake Job Detector** that analyses postings for scam and fraud signals.

Built as a single Next.js app and deployed on Cloudflare Pages — no separate backend.

---

## Features

### 🕵️ Fake Job Detector
Paste a job title and description and get an instant, structured fraud analysis powered by an LLM (Groq). It returns:

- **Verdict & risk score** — likely fraudulent vs. legitimate, with a 0–100% risk gauge
- **Confidence rating** — High / Medium / Low with reasoning
- **Fraud & legitimacy signals** — weighted by impact, with explanations
- **Categorised patterns** — e.g. urgency/pressure language, suspicious contact methods, inflated pay
- **Structural checklist** — company name, salary, application URL, contact domain, title specificity, description length
- **Plain-English summary** — a non-technical explanation of the verdict

> ⚠️ **Disclaimer:** Results are an automated AI estimate, not a definitive verdict. Always verify job postings independently.

More tools (application tracker, auto-filler, etc.) are planned.

---

## Tech Stack

- **[Next.js 15](https://nextjs.org/)** (App Router) + **React 19** + **TypeScript**
- **[Tailwind CSS v4](https://tailwindcss.com/)** and **[shadcn/ui](https://ui.shadcn.com/)** components
- **[Groq](https://groq.com/)** LLM API (`openai/gpt-oss-120b`) via a Next.js edge route handler
- Deployed to **[Cloudflare Pages](https://pages.cloudflare.com/)** with [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages)

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Groq API key](https://console.groq.com/keys)

### Setup

```bash
cd frontend
npm install
```

Create a `frontend/.env.local` file with your Groq API key:

```bash
GROQ_API_KEY=gsk_your_key_here
```

### Run

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
│   │   ├── page.tsx                              # Landing page (hero + tool grid)
│   │   ├── api/detector/route.ts                 # Edge route: calls Groq, returns structured JSON
│   │   └── tools/fake-job-detector/
│   │       ├── page.tsx                           # Server component (metadata)
│   │       └── detector-client.tsx               # Client UI (form, results)
│   └── components/
│       ├── navbar.tsx, footer.tsx, tool-card.tsx # Shared layout
│       └── ui/                                    # shadcn/ui primitives
└── ...
```

### Environment Variables

| Variable        | Description                                                             |
| --------------- | ----------------------------------------------------------------------- |
| `GROQ_API_KEY`  | Groq API key. Set in `.env.local` locally, or as a secret on Cloudflare |

---

## Deployment

The app deploys to **Cloudflare Pages** and calls the Groq API from a Next.js **edge** route handler, so no separate backend is required.

1. Connect the GitHub repo to a Cloudflare Pages project.
2. Set the build/output for `@cloudflare/next-on-pages`.
3. Add `GROQ_API_KEY` as a secret (Production environment).
4. Ensure the `nodejs_compat` compatibility flag is enabled.

Pushing to `main` triggers a rebuild and deploy.

---

## Adding a New Tool

1. Create `src/app/tools/<tool-name>/page.tsx` (server component with metadata).
2. Create a client component for the interactive UI.
3. If the tool needs an API, add `src/app/api/<tool-name>/route.ts`.
4. Add the tool to the grid in `src/app/page.tsx`.

---

## License

Released under the [MIT License](./LICENSE).
