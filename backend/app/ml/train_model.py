from __future__ import annotations

from pathlib import Path

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from .evaluation import (
    build_example_predictions,
    calculate_regression_metrics,
    print_evaluation_summary,
)
from .feature_config import categorical_features, model_input_features, numeric_features, target_column
from .model_io import DATASET_PATH, METRICS_PATH, MODEL_PATH, MODELS_DIR, save_metrics, save_model
from .synth_data import main as generate_dataset


def ensure_dataset_exists() -> None:
    if not Path(DATASET_PATH).exists():
        print("Synthetic dataset not found. Generating it now...")
        generate_dataset()


def add_time_features(dataframe: pd.DataFrame) -> pd.DataFrame:
    enriched = dataframe.copy()
    enriched["date"] = pd.to_datetime(enriched["date"])
    enriched["month"] = enriched["date"].dt.month
    enriched["day_of_week"] = enriched["date"].dt.dayofweek
    enriched["week_of_year"] = enriched["date"].dt.isocalendar().week.astype(int)
    return enriched


def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            (
                "categorical",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
                    ]
                ),
                categorical_features,
            ),
            (
                "numeric",
                Pipeline(steps=[("imputer", SimpleImputer(strategy="median"))]),
                numeric_features,
            ),
        ]
    )


def build_candidate_models() -> dict[str, Pipeline]:
    return {
        "RandomForestRegressor": Pipeline(
            steps=[
                ("preprocess", build_preprocessor()),
                (
                    "model",
                    RandomForestRegressor(
                        n_estimators=220,
                        max_depth=12,
                        min_samples_leaf=2,
                        random_state=42,
                        n_jobs=1,
                    ),
                ),
            ]
        ),
        "Ridge": Pipeline(
            steps=[
                ("preprocess", build_preprocessor()),
                ("model", Ridge(alpha=1.0)),
            ]
        ),
    }


def chronological_split(dataframe: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    sorted_frame = dataframe.sort_values("date").reset_index(drop=True)
    total_rows = len(sorted_frame)
    train_end = int(total_rows * 0.70)
    validation_end = int(total_rows * 0.85)

    train_frame = sorted_frame.iloc[:train_end].copy()
    validation_frame = sorted_frame.iloc[train_end:validation_end].copy()
    test_frame = sorted_frame.iloc[validation_end:].copy()
    return train_frame, validation_frame, test_frame


def fit_and_score_model(
    model_name: str,
    pipeline: Pipeline,
    train_features: pd.DataFrame,
    train_target: pd.Series,
    validation_features: pd.DataFrame,
    validation_target: pd.Series,
) -> dict[str, object]:
    pipeline.fit(train_features, train_target)
    validation_predictions = pipeline.predict(validation_features)
    validation_metrics = calculate_regression_metrics(validation_target, validation_predictions)

    print_evaluation_summary(
        split_name=f"Validation Metrics for {model_name}",
        metrics=validation_metrics,
    )

    return {
        "model_name": model_name,
        "pipeline": pipeline,
        "validation_predictions": validation_predictions,
        "validation_metrics": validation_metrics,
    }


def train_model() -> dict[str, object]:
    ensure_dataset_exists()

    raw_dataframe = pd.read_csv(DATASET_PATH)
    dataframe = add_time_features(raw_dataframe)

    train_frame, validation_frame, test_frame = chronological_split(dataframe)

    x_train = train_frame[model_input_features]
    y_train = train_frame[target_column]
    x_validation = validation_frame[model_input_features]
    y_validation = validation_frame[target_column]
    x_test = test_frame[model_input_features]
    y_test = test_frame[target_column]

    candidate_results = []
    for model_name, pipeline in build_candidate_models().items():
        candidate_results.append(
            fit_and_score_model(
                model_name=model_name,
                pipeline=pipeline,
                train_features=x_train,
                train_target=y_train,
                validation_features=x_validation,
                validation_target=y_validation,
            )
        )

    best_result = min(candidate_results, key=lambda item: item["validation_metrics"]["mae"])
    best_model_name = str(best_result["model_name"])
    best_pipeline = best_result["pipeline"]

    combined_train_frame = pd.concat([train_frame, validation_frame], ignore_index=True)
    best_pipeline.fit(combined_train_frame[model_input_features], combined_train_frame[target_column])

    test_predictions = best_pipeline.predict(x_test)
    test_metrics = calculate_regression_metrics(y_test, test_predictions)
    example_predictions = build_example_predictions(x_test, y_test, test_predictions)
    print_evaluation_summary("Test Metrics", test_metrics, example_predictions)

    metrics = {
        "selected_model": best_model_name,
        "dataset_path": DATASET_PATH,
        "model_path": MODEL_PATH,
        "metrics_path": METRICS_PATH,
        "train_rows": int(len(train_frame)),
        "validation_rows": int(len(validation_frame)),
        "test_rows": int(len(test_frame)),
        "validation_results": [
            {
                "model_name": str(result["model_name"]),
                **result["validation_metrics"],
            }
            for result in candidate_results
        ],
        "test_metrics": test_metrics,
        "example_predictions": example_predictions,
        "feature_columns": model_input_features,
        "target_column": target_column,
    }

    save_model(best_pipeline)
    save_metrics(metrics)

    print(f"\nSelected model: {best_model_name}")
    print(f"Saved model to {MODEL_PATH.relative_to(MODELS_DIR.parent)}")
    print(f"Saved metrics to {METRICS_PATH.relative_to(MODELS_DIR.parent)}")

    return metrics


if __name__ == "__main__":
    train_model()
