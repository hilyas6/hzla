from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BACKEND_DIR.parent

MODEL_DIR = BACKEND_DIR / "models" / "textgcn_tuned"
METRICS_PATH = REPO_ROOT / "reports" / "tuned" / "metrics_textgcn_tuned.csv"
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
