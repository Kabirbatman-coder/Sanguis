from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd

from .feature_config import model_input_features
from .model_io import METRICS_PATH, MODEL_PATH, load_metrics, load_model


DEFAULT_INPUT: dict[str, Any] = {
    "date": datetime.now().strftime("%Y-%m-%d"),
    "state": "Maharashtra",
    "district": "Mumbai",
    "blood_group": "O+",
    "center_type": "Government",
    "current_stock_units": 40,
    "expiring_72h_units": 5,
    "issued_last_7d_units": 38,
    "collected_last_7d_units": 28,
    "hospital_occupancy_pct": 82.0,
    "dengue_season_flag": 0,
    "holiday_flag": 0,
}


def assign_shortage_risk_tier(shortage_gap: float) -> str:
    if shortage_gap <= 0:
        return "low"
    if shortage_gap >= 20:
        return "critical"
    if shortage_gap >= 10:
        return "high"
    if shortage_gap >= 4:
        return "medium"
    return "low"


def ensure_model_ready() -> None:
    if not Path(MODEL_PATH).exists() or not Path(METRICS_PATH).exists():
        raise FileNotFoundError(
            "Saved model artifacts were not found. Run `py -m app.ml.train_model` from the backend folder first."
        )


def _safe_int(value: Any, default_value: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default_value


def _safe_float(value: Any, default_value: float) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default_value


def normalize_prediction_input(input_dict: dict[str, Any] | None) -> dict[str, Any]:
    payload = {**DEFAULT_INPUT, **(input_dict or {})}

    # If date is missing, default to today's date so the helper is easy to test.
    raw_date = payload.get("date", DEFAULT_INPUT["date"])

    try:
        parsed_date = pd.to_datetime(raw_date)
    except Exception:
        parsed_date = pd.to_datetime(DEFAULT_INPUT["date"])

    payload["date"] = parsed_date.strftime("%Y-%m-%d")
    payload["month"] = int(parsed_date.month)
    payload["day_of_week"] = int(parsed_date.dayofweek)
    payload["week_of_year"] = int(parsed_date.isocalendar().week)

    payload["state"] = str(payload.get("state") or DEFAULT_INPUT["state"])
    payload["district"] = str(payload.get("district") or DEFAULT_INPUT["district"])
    payload["blood_group"] = str(payload.get("blood_group") or DEFAULT_INPUT["blood_group"])
    payload["center_type"] = str(payload.get("center_type") or DEFAULT_INPUT["center_type"])

    payload["current_stock_units"] = max(0, _safe_int(payload.get("current_stock_units"), DEFAULT_INPUT["current_stock_units"]))
    payload["expiring_72h_units"] = max(0, _safe_int(payload.get("expiring_72h_units"), DEFAULT_INPUT["expiring_72h_units"]))
    payload["issued_last_7d_units"] = max(0, _safe_int(payload.get("issued_last_7d_units"), DEFAULT_INPUT["issued_last_7d_units"]))
    payload["collected_last_7d_units"] = max(0, _safe_int(payload.get("collected_last_7d_units"), DEFAULT_INPUT["collected_last_7d_units"]))
    payload["hospital_occupancy_pct"] = min(
        100.0,
        max(0.0, _safe_float(payload.get("hospital_occupancy_pct"), DEFAULT_INPUT["hospital_occupancy_pct"])),
    )
    payload["dengue_season_flag"] = 1 if _safe_int(payload.get("dengue_season_flag"), DEFAULT_INPUT["dengue_season_flag"]) > 0 else 0
    payload["holiday_flag"] = 1 if _safe_int(payload.get("holiday_flag"), DEFAULT_INPUT["holiday_flag"]) > 0 else 0

    return payload


def build_model_input(input_dict: dict[str, Any] | None) -> pd.DataFrame:
    normalized_input = normalize_prediction_input(input_dict)
    return pd.DataFrame([{feature_name: normalized_input[feature_name] for feature_name in model_input_features}])


def get_model_metadata() -> dict[str, Any]:
    metrics = load_metrics()
    test_metrics = metrics.get("test_metrics", {}) if isinstance(metrics, dict) else {}
    return {
        "model_name": metrics.get("selected_model", "unknown") if isinstance(metrics, dict) else "unknown",
        "mae": test_metrics.get("mae"),
    }


def predict_shortage(input_dict: dict[str, Any] | None) -> dict[str, Any]:
    ensure_model_ready()

    model = load_model()
    normalized_input = normalize_prediction_input(input_dict)
    model_input = build_model_input(normalized_input)
    model_metadata = get_model_metadata()

    predicted_demand = round(float(model.predict(model_input)[0]), 1)
    usable_stock = max(0, normalized_input["current_stock_units"] - normalized_input["expiring_72h_units"])
    shortage_gap = round(predicted_demand - usable_stock, 1)
    shortage_risk_tier = assign_shortage_risk_tier(shortage_gap)

    return {
        "demand_next_7d_pred": predicted_demand,
        "usable_stock": usable_stock,
        "shortage_gap": shortage_gap,
        "shortage_risk_tier": shortage_risk_tier,
        "model_name": model_metadata["model_name"],
        "mae": model_metadata["mae"],
    }


def get_sample_test_cases() -> list[tuple[str, dict[str, Any]]]:
    return [
        (
            "Low Risk",
            {
                "date": "2025-02-10",
                "state": "Tamil Nadu",
                "district": "Coimbatore",
                "blood_group": "A+",
                "center_type": "Hospital",
                "current_stock_units": 82,
                "expiring_72h_units": 4,
                "issued_last_7d_units": 24,
                "collected_last_7d_units": 30,
                "hospital_occupancy_pct": 72,
                "dengue_season_flag": 0,
                "holiday_flag": 0,
            },
        ),
        (
            "Medium Risk",
            {
                "date": "2025-07-18",
                "state": "Uttar Pradesh",
                "district": "Lucknow",
                "blood_group": "B+",
                "center_type": "Hospital",
                "current_stock_units": 36,
                "expiring_72h_units": 5,
                "issued_last_7d_units": 31,
                "collected_last_7d_units": 22,
                "hospital_occupancy_pct": 82,
                "dengue_season_flag": 1,
                "holiday_flag": 0,
            },
        ),
        (
            "High Risk",
            {
                "date": "2025-09-12",
                "state": "Maharashtra",
                "district": "Mumbai",
                "blood_group": "O-",
                "center_type": "Government",
                "current_stock_units": 36,
                "expiring_72h_units": 6,
                "issued_last_7d_units": 31,
                "collected_last_7d_units": 18,
                "hospital_occupancy_pct": 89,
                "dengue_season_flag": 1,
                "holiday_flag": 0,
            },
        ),
        (
            "Critical Shortage",
            {
                "date": "2025-10-03",
                "state": "West Bengal",
                "district": "Kolkata",
                "blood_group": "O+",
                "center_type": "Government",
                "current_stock_units": 18,
                "expiring_72h_units": 3,
                "issued_last_7d_units": 46,
                "collected_last_7d_units": 16,
                "hospital_occupancy_pct": 93,
                "dengue_season_flag": 1,
                "holiday_flag": 0,
            },
        ),
    ]


def main() -> None:
    for case_name, case_input in get_sample_test_cases():
        print(f"\n{case_name}")
        print("-" * 40)
        print(json.dumps(predict_shortage(case_input), indent=2))


if __name__ == "__main__":
    main()
