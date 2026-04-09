from __future__ import annotations

from ..ml.model_io import METRICS_PATH, MODEL_PATH, to_backend_relative
from ..ml.predict import predict_shortage
from ..schemas import RecommendationItem, RecommendationsResponse, RiskTier


def get_missing_ml_artifacts() -> list[str]:
    return [to_backend_relative(path) for path in [MODEL_PATH, METRICS_PATH] if not path.exists()]


def ensure_ml_artifacts_exist() -> None:
    """
    The API should only serve saved artifacts.
    It should not retrain the model on startup.
    """
    missing_paths = get_missing_ml_artifacts()
    if missing_paths:
        missing_text = ", ".join(missing_paths)
        raise FileNotFoundError(
            f"Missing ML artifacts: {missing_text}. Run `python -m app.ml.train_model` from the backend folder first."
        )


def run_forecast(payload: dict) -> dict:
    ensure_ml_artifacts_exist()
    return predict_shortage(payload)


def build_recommendations(
    shortage_risk_tier: RiskTier,
    district: str | None = None,
    blood_group: str | None = None,
) -> RecommendationsResponse:
    district_label = district or "selected district"
    blood_group_label = blood_group or "selected blood group"

    recommendation_map: dict[RiskTier, list[RecommendationItem]] = {
        "low": [
            RecommendationItem(
                shortage_risk_tier="low",
                priority="low",
                title="Monitor stock levels",
                description=(
                    f"Supply for {blood_group_label} in {district_label} appears stable. "
                    "Continue normal monitoring and routine replenishment checks."
                ),
                recommended_action="Monitor stock",
            )
        ],
        "medium": [
            RecommendationItem(
                shortage_risk_tier="medium",
                priority="medium",
                title="Notify district coordinator",
                description=(
                    f"There is an emerging shortage signal for {blood_group_label} in {district_label}. "
                    "Notify the district coordinator and review nearby inventory options."
                ),
                recommended_action="Notify district coordinator",
            )
        ],
        "high": [
            RecommendationItem(
                shortage_risk_tier="high",
                priority="high",
                title="Prepare redistribution plan",
                description=(
                    f"Demand is likely to exceed usable stock for {blood_group_label} in {district_label}. "
                    "Recommend redistribution from a nearby surplus blood center."
                ),
                recommended_action="Recommend redistribution from nearby surplus center",
            )
        ],
        "critical": [
            RecommendationItem(
                shortage_risk_tier="critical",
                priority="critical",
                title="Redistribute urgently",
                description=(
                    f"Urgent shortage risk detected for {blood_group_label} in {district_label}. "
                    "Move available units from nearby surplus centers immediately."
                ),
                recommended_action="Urgent redistribution",
            ),
            RecommendationItem(
                shortage_risk_tier="critical",
                priority="critical",
                title="Trigger donor outreach",
                description=(
                    f"Launch targeted donor outreach for {blood_group_label} in {district_label} "
                    "to reduce the expected shortage gap."
                ),
                recommended_action="Trigger donor outreach",
            ),
        ],
    }

    return RecommendationsResponse(
        shortage_risk_tier=shortage_risk_tier,
        district=district,
        blood_group=blood_group,
        actions=recommendation_map[shortage_risk_tier],
    )
