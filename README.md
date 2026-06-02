# hzla_export — Fake Job Detector Module

Self-contained export of the fake job detector, ready to integrate into the **hzla** project.

## Structure

```
hzla_export/
├── .streamlit/
│   └── config.toml                  # Streamlit theme (iOS light)
├── fake_job_detector/
│   ├── app.py                       # Main Streamlit detector page
│   ├── model_runtime.py             # ImprovedWordGCN model + inference service
│   ├── explain_ui.py                # Explainability UI helpers
│   ├── pages/
│   │   └── 2_Explainability.py      # Full explanation report page
│   ├── models/
│   │   └── textgcn_tuned/
│   │       ├── textgcn_tuned.pt         # Trained TextGCN weights (Git LFS)
│   │       ├── graph_cache_tuned.pt     # Pre-built graph (Git LFS)
│   │       └── vectorizer_tuned.joblib  # TF-IDF vectorizer (Git LFS)
│   └── reports/
│       └── tuned/
│           └── metrics_textgcn_tuned.csv  # Model performance metrics
├── requirements.txt
└── README.md
```

## Quick Start

```bash
pip install -r requirements.txt
streamlit run fake_job_detector/app.py
```

## Integration into hzla

In your hzla project, place the `fake_job_detector/` folder wherever your tools live.
For a multi-page Streamlit app, you can either:

1. **Import the service directly** in your own pages:
   ```python
   from fake_job_detector.model_runtime import load_model
   service = load_model()
   result = service.predict_from_preprocessed(service.preprocess_text("job text here"))
   ```

2. **Use the pages as-is** by symlinking or copying them into your Streamlit pages directory.

## Model Artifacts

The `.pt` and `.joblib` files are large (Git LFS tracked). Make sure to:
- Add `*.pt`, `*.joblib` to your `.gitattributes` for Git LFS tracking
- Or store them outside git and load from a shared path

## Key Dependencies

- `torch` + `torch-geometric` — TextGCN inference
- `shap` — SHAP-based explainability
- `streamlit` — web UI
- `plotly` — charts in the explainability page
