from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib


APP_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = APP_DIR.parent
DATA_DIR = BACKEND_DIR / "data"
MODELS_DIR = BACKEND_DIR / "models"
DATASET_PATH = DATA_DIR / "synthetic_blood_timeseries.csv"
MODEL_PATH = MODELS_DIR / "demand_model.joblib"
METRICS_PATH = MODELS_DIR / "metrics.json"


def ensure_directories() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)


def to_backend_relative(path: Path) -> str:
    try:
        return path.resolve().relative_to(BACKEND_DIR.resolve()).as_posix()
    except ValueError:
        return path.as_posix()


def _sanitize_metrics(metrics: dict[str, Any]) -> dict[str, Any]:
    sanitized = dict(metrics)

    for key in ("dataset_path", "model_path", "metrics_path"):
        value = sanitized.get(key)
        if isinstance(value, Path):
            sanitized[key] = to_backend_relative(value)
        elif isinstance(value, str) and value:
            sanitized[key] = to_backend_relative(Path(value))

    return sanitized


def save_model(model: Any) -> None:
    ensure_directories()
    joblib.dump(model, MODEL_PATH)


def load_model() -> Any:
    return joblib.load(MODEL_PATH)


def save_metrics(metrics: dict[str, Any]) -> None:
    ensure_directories()
    with METRICS_PATH.open("w", encoding="utf-8") as metrics_file:
        json.dump(_sanitize_metrics(metrics), metrics_file, indent=2)


def load_metrics() -> dict[str, Any]:
    if not METRICS_PATH.exists():
        return {}

    with METRICS_PATH.open("r", encoding="utf-8") as metrics_file:
        return _sanitize_metrics(json.load(metrics_file))
