from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS
from .dependencies import get_model
from .routers import detector


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_model()  # warm up model on startup
    yield


app = FastAPI(title="HZLA API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detector.router, prefix="/api/detector", tags=["Fake Job Detector"])


@app.get("/api/health")
def root_health():
    return {"status": "ok", "service": "hzla-api"}
