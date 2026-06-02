from functools import lru_cache

from .ml.model_runtime import ImprovedTextGCNService
from .config import MODEL_DIR, METRICS_PATH


@lru_cache(maxsize=1)
def get_model() -> ImprovedTextGCNService:
    return ImprovedTextGCNService(
        model_dir=MODEL_DIR,
        metrics_path=METRICS_PATH,
    )
