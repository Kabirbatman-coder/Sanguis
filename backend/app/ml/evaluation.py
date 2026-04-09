from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def calculate_regression_metrics(actual: pd.Series, predicted: np.ndarray) -> dict[str, float]:
    """
    Beginner-friendly regression metrics.

    - MAE: average absolute error in units. Lower is better.
    - RMSE: larger mistakes get penalized more strongly. Lower is better.
    - R2: how much variance the model explains. Higher is better.
    """
    return {
        "mae": round(float(mean_absolute_error(actual, predicted)), 3),
        "rmse": round(float(np.sqrt(mean_squared_error(actual, predicted))), 3),
        "r2": round(float(r2_score(actual, predicted)), 3),
    }


def build_example_predictions(
    features: pd.DataFrame,
    actual: pd.Series,
    predicted: np.ndarray,
    sample_size: int = 5,
) -> list[dict[str, Any]]:
    examples: list[dict[str, Any]] = []

    preview_rows = features.head(sample_size).copy()
    preview_rows["actual_demand_next_7d_units"] = actual.head(sample_size).tolist()
    preview_rows["predicted_demand_next_7d_units"] = np.round(predicted[:sample_size], 1).tolist()

    for _, row in preview_rows.iterrows():
        examples.append(
            {
                "state": row["state"],
                "district": row["district"],
                "blood_group": row["blood_group"],
                "actual_demand_next_7d_units": row["actual_demand_next_7d_units"],
                "predicted_demand_next_7d_units": row["predicted_demand_next_7d_units"],
            }
        )

    return examples


def print_evaluation_summary(
    split_name: str,
    metrics: dict[str, float],
    examples: list[dict[str, Any]] | None = None,
) -> None:
    print(f"\n{split_name} Metrics")
    print("-" * 40)
    print(f"MAE : {metrics['mae']}")
    print(f"RMSE: {metrics['rmse']}")
    print(f"R2  : {metrics['r2']}")

    if examples:
        print("\nExample Predictions")
        print("-" * 40)
        for example in examples:
            print(
                f"{example['district']} | {example['blood_group']} | "
                f"actual={example['actual_demand_next_7d_units']} | "
                f"predicted={example['predicted_demand_next_7d_units']}"
            )
