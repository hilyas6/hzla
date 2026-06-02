# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**JobScan** — a fake job posting detector built on a Text Graph Convolutional Network (TextGCN). The app is a Streamlit multi-page application that takes a job title + description, runs inference through a tuned TextGCN model, and displays a fraud probability verdict with SHAP-based explainability.

This repo is a self-contained export (`hzla_export`) meant to be integrated into a larger **hzla** project.

## Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run the app
streamlit run fake_job_detector/app.py
```

There are no tests or linting configured in this repo.

## Architecture

### Inference pipeline (`model_runtime.py`)

`ImprovedTextGCNService` is the core inference class, loaded once per Streamlit session via `@st.cache_resource` in `load_model()`. On init it:
1. Loads a TF-IDF vectorizer (`vectorizer_tuned.joblib`), a pre-built word-word graph (`graph_cache_tuned.pt`), and model weights (`textgcn_tuned.pt`)
2. Reconstructs the sparse adjacency matrix and runs a single GCN forward pass to cache word-level hidden states (`_cached_word_h`)
3. At inference time, new text is TF-IDF-vectorized and projected into the cached word embedding space via `forward_with_cached_word_h`

Key service methods:
- `preprocess_text(text)` → scipy sparse TF-IDF matrix
- `predict_from_preprocessed(x)` → `PredictionResult` (label, fake/real probabilities)
- `explain_text(text, mode)` → `ExplanationResult` with SHAP token attribution + occlusion audit
- `estimate_uncertainty_interval(x, n)` → MC dropout confidence interval
- `input_quality(title, desc)` → detects missing fields (company, location, salary, URL)

### Model architecture (`ImprovedWordGCN`)

3-layer GCN with residual connections (α=0.7), LayerNorm, and an MLP head. Must stay in sync with `train_textgcn_enhanced.py` (not in this repo). Hidden dim=300, dropout=0.35. Decision threshold (0.48) is read from `metrics_textgcn_tuned.csv`.

### Streamlit pages

- **`app.py`** — Main detector page. Two-column layout: input form (left) and results panel (right). Stores prediction/explanation in `st.session_state` for cross-page access.
- **`pages/2_Explainability.py`** — Full explanation report with 5 tabs: Plain English (categorised fraud patterns + structural checklist), Model Signals (SHAP bars + occlusion audit via plotly), Highlighted Text, Methodology, and Feedback. Reads from `st.session_state.last_prediction` / `last_explanation`.

### Explainability helpers (`explain_ui.py`)

Pure-Python module (no Streamlit imports) providing:
- `categorise_signals()` — maps SHAP tokens to `FRAUD_CATEGORIES` (urgency, salary, contact, etc.)
- `structural_checklist()` — regex-based checks for company name, salary, URL, email domain, etc.
- `build_plain_english_summary()` — generates natural language verdict explanation
- `build_highlight_spans()` / `render_highlighted_html()` — inline text highlighting
- `redact_emails()` / `redact_phones()` — PII redaction for feedback logging

### Data flow

`app.py` runs inference → stores results in `st.session_state.last_prediction` and `st.session_state.last_explanation` → `2_Explainability.py` reads those session state keys to render the report. Both pages call `load_model()` which returns the same cached service instance.

## Model Artifacts

The `.pt` and `.joblib` files under `fake_job_detector/models/textgcn_tuned/` are large and should be Git LFS tracked. The code detects LFS pointer files and raises an error if `git lfs pull` hasn't been run.

## Key Dependencies

- `torch` + `torch-geometric` — GCN inference
- `shap` — SHAP explainability (optional; gracefully degrades if missing)
- `streamlit` — web UI framework
- `plotly` — interactive charts on the explainability page
- `scikit-learn` / `joblib` — TF-IDF vectorizer serialization
