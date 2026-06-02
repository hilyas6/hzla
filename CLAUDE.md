# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HZLA** is a monorepo for an AI-powered job seeker platform. It hosts multiple tools (fake job detector, application tracker, auto-filler, etc.) behind a single modern web interface. The project uses a **Next.js frontend** with a **FastAPI backend**.

## Commands

### Frontend (Next.js + Tailwind + shadcn/ui)

```bash
cd frontend
npm install          # install dependencies
npm run dev          # dev server on http://localhost:3000
npm run build        # production build
npm run lint         # ESLint
```

Add shadcn components: `npx shadcn@latest add <component>`

### Backend (FastAPI + PyTorch)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload    # dev server on http://localhost:8000
```

API docs at `http://localhost:8000/docs` when running.

### Running both together

Start the backend first (`uvicorn`), then the frontend (`npm run dev`). The frontend proxies `/api/*` requests to `localhost:8000` via Next.js rewrites in `next.config.ts`.

## Architecture

### Frontend (`frontend/`)

Next.js 16 App Router with TypeScript, Tailwind CSS v4, and shadcn/ui components.

- `src/app/page.tsx` — Landing page with hero + tool grid
- `src/app/tools/fake-job-detector/page.tsx` — Fake job detector tool page
- `src/components/` — Shared components (navbar, footer, tool-card)
- `src/components/ui/` — shadcn/ui primitives (button, card, badge)
- `next.config.ts` — API proxy rewrites to backend

### Backend (`backend/`)

FastAPI application serving ML model inference as REST endpoints.

- `app/main.py` — FastAPI app with CORS and lifespan model warmup
- `app/config.py` — Path constants and CORS origins
- `app/dependencies.py` — Singleton model loader (replaces Streamlit's `@st.cache_resource`)
- `app/routers/detector.py` — `/api/detector/predict` and `/api/detector/explain` endpoints
- `ml/model_runtime.py` — `ImprovedTextGCNService` class: TextGCN model loading, TF-IDF preprocessing, inference, MC dropout uncertainty, SHAP explanations, occlusion audit
- `ml/explain_ui.py` — Pure Python helpers: fraud category mapping, structural checklist, plain-English summary generation, text highlighting, PII redaction

### ML Model (`backend/models/textgcn_tuned/`)

3-layer GCN with residual connections (hidden=300, dropout=0.35, alpha=0.7). Artifacts are Git LFS tracked:
- `textgcn_tuned.pt` — model weights
- `graph_cache_tuned.pt` — pre-built word-word adjacency matrix
- `vectorizer_tuned.joblib` — TF-IDF vectorizer

Decision threshold (0.48) read from `reports/tuned/metrics_textgcn_tuned.csv`.

### Data Flow

Frontend calls `/api/detector/predict` → Next.js rewrites to FastAPI → `detector.py` router uses `get_model()` dependency → `ImprovedTextGCNService` runs inference → JSON response back to frontend.

## Adding a New Tool

1. **Backend**: Create `app/routers/<tool>.py` with FastAPI router, add any ML/service code in `ml/`, include router in `app/main.py`
2. **Frontend**: Create `src/app/tools/<tool-name>/page.tsx`, add the tool to the grid in `src/app/page.tsx`
