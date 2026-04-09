from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import get_allowed_cors_origins
from .schemas import ForecastRequest, ForecastResponse, RecommendationsResponse, RiskTier
from .services.api_service import build_recommendations, get_missing_ml_artifacts, run_forecast


app = FastAPI(
    title="BloodFlow AI API",
    description="Hackathon prototype API for blood demand forecasting and shortage recommendations.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=None)
def health_check() -> JSONResponse:
    missing_artifacts = get_missing_ml_artifacts()
    if missing_artifacts:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "error",
                "detail": "ML artifacts are missing.",
                "missing_artifacts": missing_artifacts,
            },
        )

    return JSONResponse(content={"status": "ok"})


@app.post("/forecast", response_model=ForecastResponse)
def forecast_blood_demand(request: ForecastRequest) -> ForecastResponse:
    # Exclude empty values so the ML helper can apply its own defaults cleanly.
    try:
        forecast_result = run_forecast(request.model_dump(exclude_none=True))
        return ForecastResponse(**forecast_result)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@app.get("/recommendations", response_model=RecommendationsResponse)
def recommendations(
    shortage_risk_tier: RiskTier = Query(...),
    district: str | None = Query(default=None),
    blood_group: str | None = Query(default=None),
) -> RecommendationsResponse:
    return build_recommendations(
        shortage_risk_tier=shortage_risk_tier,
        district=district,
        blood_group=blood_group,
    )
