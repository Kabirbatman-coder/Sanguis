from __future__ import annotations

import os
from functools import lru_cache


LOCAL_FRONTEND_ORIGINS = (
    "http://localhost:5173",
    "http://127.0.0.1:5173",
)


def _normalize_origin(origin: str) -> str:
    return origin.strip().rstrip("/")


def _parse_csv_env(value: str | None) -> list[str]:
    if not value:
        return []

    return [_normalize_origin(item) for item in value.split(",") if item.strip()]


@lru_cache(maxsize=1)
def get_allowed_cors_origins() -> list[str]:
    configured_origins = _parse_csv_env(os.getenv("CORS_ORIGINS"))
    return list(dict.fromkeys([*LOCAL_FRONTEND_ORIGINS, *configured_origins]))
