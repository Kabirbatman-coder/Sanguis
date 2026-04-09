from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


RiskTier = Literal["low", "medium", "high", "critical"]


class ForecastRequest(BaseModel):
    # Most fields are optional because the ML helper can apply safe defaults.
    date: str | None = None
    state: str | None = None
    district: str | None = None
    blood_group: str | None = None
    center_type: str | None = None
    current_stock_units: int | None = Field(default=None, ge=0)
    expiring_72h_units: int | None = Field(default=None, ge=0)
    issued_last_7d_units: int | None = Field(default=None, ge=0)
    collected_last_7d_units: int | None = Field(default=None, ge=0)
    hospital_occupancy_pct: float | None = Field(default=None, ge=0, le=100)
    dengue_season_flag: int | None = Field(default=None, ge=0, le=1)
    holiday_flag: int | None = Field(default=None, ge=0, le=1)


class ForecastResponse(BaseModel):
    demand_next_7d_pred: float
    usable_stock: int
    shortage_gap: float
    shortage_risk_tier: RiskTier
    model_name: str
    mae: float


class RecommendationItem(BaseModel):
    shortage_risk_tier: RiskTier
    priority: str
    title: str
    description: str
    recommended_action: str


class RecommendationsResponse(BaseModel):
    shortage_risk_tier: RiskTier
    district: str | None = None
    blood_group: str | None = None
    actions: list[RecommendationItem]
