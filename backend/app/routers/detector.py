from __future__ import annotations

from pydantic import BaseModel
from fastapi import APIRouter, Depends

from ..dependencies import get_model
from ..ml.model_runtime import ImprovedTextGCNService
from ..ml.explain_ui import (
    categorise_signals,
    structural_checklist,
    build_plain_english_summary,
)

router = APIRouter()


class DetectorRequest(BaseModel):
    title: str
    description: str


class PredictResponse(BaseModel):
    label: str
    fake_probability: float
    real_probability: float
    confidence: float
    threshold: float
    ci_low: float
    ci_high: float
    reliability_bucket: str
    reliability_msg: str
    missing_fields: list[str]
    text_length: int
    model_signature: str


class ExplainRequest(BaseModel):
    title: str
    description: str
    mode: str = "fast"


class ExplainResponse(BaseModel):
    top_increase_fake: list[dict]
    top_decrease_fake: list[dict]
    audit_top_increase_fake: list[dict]
    audit_top_decrease_fake: list[dict]
    phrase_top_increase_fake: list[dict]
    phrase_top_decrease_fake: list[dict]
    shap_error: str | None
    mode: str
    categorised_signals: list[dict]
    structural_checks: list[dict]
    plain_english_summary: str


@router.get("/health")
def health(service: ImprovedTextGCNService = Depends(get_model)):
    return {"status": "ok", "model": service.model_signature}


@router.post("/predict", response_model=PredictResponse)
def predict(req: DetectorRequest, service: ImprovedTextGCNService = Depends(get_model)):
    text = f"{req.title}\n\n{req.description}"
    preprocessed = service.preprocess_text(text)
    prediction = service.predict_from_preprocessed(preprocessed)
    ci_low, ci_high = service.estimate_uncertainty_interval(preprocessed, n=12)
    quality = service.input_quality(req.title, req.description)
    bucket, msg = service.reliability_bucket(ci_low, ci_high, quality)

    return PredictResponse(
        label=prediction.label,
        fake_probability=prediction.fake_probability,
        real_probability=prediction.real_probability,
        confidence=prediction.confidence,
        threshold=prediction.threshold,
        ci_low=ci_low,
        ci_high=ci_high,
        reliability_bucket=bucket,
        reliability_msg=msg,
        missing_fields=quality["missing_fields_list"],
        text_length=quality["text_length"],
        model_signature=service.model_signature,
    )


@router.post("/explain", response_model=ExplainResponse)
def explain(req: ExplainRequest, service: ImprovedTextGCNService = Depends(get_model)):
    text = f"{req.title}\n\n{req.description}"
    explanation = service.explain_text(text, mode=req.mode)
    prediction = service.predict_from_preprocessed(service.preprocess_text(text))

    categorised = categorise_signals(
        explanation.top_increase_fake,
        explanation.top_decrease_fake,
    )
    checks = structural_checklist(req.title, req.description)
    summary = build_plain_english_summary(
        categorised, prediction.fake_probability, prediction.label, checks,
    )

    return ExplainResponse(
        top_increase_fake=explanation.top_increase_fake,
        top_decrease_fake=explanation.top_decrease_fake,
        audit_top_increase_fake=explanation.audit_top_increase_fake,
        audit_top_decrease_fake=explanation.audit_top_decrease_fake,
        phrase_top_increase_fake=explanation.phrase_top_increase_fake,
        phrase_top_decrease_fake=explanation.phrase_top_decrease_fake,
        shap_error=explanation.shap_error,
        mode=explanation.mode,
        categorised_signals=categorised,
        structural_checks=checks,
        plain_english_summary=summary,
    )
