from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd

from .model_io import DATASET_PATH, ensure_directories


@dataclass(frozen=True)
class DistrictProfile:
    state: str
    district: str
    center_type: str
    baseline_stock: int
    baseline_occupancy: int
    urban_pressure: float


# These profiles make the synthetic data feel like a real multi-state network.
DISTRICT_PROFILES = [
    DistrictProfile("Maharashtra", "Mumbai", "Government", 150, 88, 1.20),
    DistrictProfile("Maharashtra", "Pune", "Hospital", 122, 80, 1.00),
    DistrictProfile("Karnataka", "Bengaluru Urban", "Government", 145, 86, 1.15),
    DistrictProfile("Karnataka", "Mysuru", "Hospital", 104, 75, 0.86),
    DistrictProfile("Tamil Nadu", "Chennai", "Government", 140, 84, 1.10),
    DistrictProfile("Tamil Nadu", "Coimbatore", "Hospital", 108, 77, 0.90),
    DistrictProfile("Telangana", "Hyderabad", "Government", 136, 83, 1.05),
    DistrictProfile("Telangana", "Warangal", "Hospital", 95, 72, 0.78),
    DistrictProfile("Uttar Pradesh", "Lucknow", "Hospital", 118, 79, 0.96),
    DistrictProfile("Uttar Pradesh", "Kanpur", "Government", 126, 81, 1.02),
    DistrictProfile("West Bengal", "Kolkata", "Government", 142, 85, 1.12),
    DistrictProfile("West Bengal", "Siliguri", "Hospital", 92, 71, 0.76),
]

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

# Common groups are more available, while O-negative and AB-negative are rarer.
SUPPLY_MULTIPLIER = {
    "A+": 0.98,
    "A-": 0.48,
    "B+": 1.02,
    "B-": 0.45,
    "AB+": 0.52,
    "AB-": 0.18,
    "O+": 1.10,
    "O-": 0.22,
}

# Demand is not exactly the same as supply. O-negative is rare but strategically important.
DEMAND_MULTIPLIER = {
    "A+": 0.95,
    "A-": 0.46,
    "B+": 1.00,
    "B-": 0.43,
    "AB+": 0.48,
    "AB-": 0.20,
    "O+": 1.12,
    "O-": 0.34,
}


def generate_synthetic_dataset(days: int = 420, random_seed: int = 42) -> pd.DataFrame:
    """
    Create a synthetic time-series dataset for hackathon ML experiments.

    The goal is not medical realism down to every operational detail.
    The goal is believable structure:
    - multiple states and districts
    - blood-group scarcity differences
    - demand linked to recent issue volume and hospital occupancy
    - seasonal shocks such as dengue season
    - donation pressure on holidays
    """
    rng = np.random.default_rng(random_seed)
    start_date = pd.Timestamp("2024-01-01")
    dates = pd.date_range(start_date, periods=days, freq="D")
    records: list[dict[str, object]] = []

    for district_profile in DISTRICT_PROFILES:
        district_factor = district_profile.urban_pressure
        for blood_group in BLOOD_GROUPS:
            supply_factor = SUPPLY_MULTIPLIER[blood_group]
            demand_factor = DEMAND_MULTIPLIER[blood_group]

            running_stock = district_profile.baseline_stock * supply_factor

            for current_date in dates:
                month = current_date.month
                day_of_week = current_date.dayofweek
                week_of_year = int(current_date.isocalendar().week)
                is_weekend = 1 if day_of_week >= 5 else 0

                dengue_season_flag = 1 if month in [7, 8, 9, 10] else 0
                holiday_flag = 1 if current_date.day in [1, 15, 26] or day_of_week == 6 else 0

                # Occupancy rises slightly during dengue season and in urban districts.
                occupancy_noise = rng.normal(0, 3.8)
                hospital_occupancy_pct = np.clip(
                    district_profile.baseline_occupancy
                    + (4.5 if dengue_season_flag else 0.0)
                    + district_factor * 3.0
                    + occupancy_noise,
                    55,
                    98,
                )

                # Recent demand is driven by occupancy, seasonality, blood-group pattern, and urban pressure.
                issued_last_7d_units = max(
                    3,
                    round(
                        9
                        + 14 * demand_factor
                        + district_factor * 7.0
                        + (hospital_occupancy_pct - 70) * 0.32
                        + (5.0 if dengue_season_flag else 0.0)
                        + (1.4 if is_weekend else 0.0)
                        + rng.normal(0, 2.5)
                    ),
                )

                # Collection is sensitive to holidays and does not perfectly track demand.
                collected_last_7d_units = max(
                    2,
                    round(
                        10
                        + 15 * supply_factor
                        + district_factor * 5.0
                        - (3.5 if holiday_flag else 0.0)
                        - (1.5 if dengue_season_flag else 0.0)
                        + rng.normal(0, 3.2)
                    ),
                )

                expiring_72h_units = max(
                    0,
                    round(
                        2.5
                        + running_stock * 0.035
                        + (1.2 if collected_last_7d_units > issued_last_7d_units else 0.0)
                        + rng.normal(0, 1.4)
                    ),
                )

                # The next 7-day demand is correlated with recent issues and occupancy.
                demand_next_7d_units = max(
                    4,
                    round(
                        issued_last_7d_units * 0.58
                        + collected_last_7d_units * 0.10
                        + (hospital_occupancy_pct - 65) * 0.42
                        + district_factor * 6.0
                        + (6.5 if dengue_season_flag else 0.0)
                        + (2.0 if holiday_flag else 0.0)
                        + rng.normal(0, 2.2)
                    ),
                )

                current_stock_units = max(
                    6,
                    round(
                        running_stock
                        + collected_last_7d_units * 0.72
                        - issued_last_7d_units * 0.61
                        - expiring_72h_units * 0.50
                        + rng.normal(0, 5.0)
                    ),
                )

                running_stock = current_stock_units

                records.append(
                    {
                        "date": current_date.strftime("%Y-%m-%d"),
                        "state": district_profile.state,
                        "district": district_profile.district,
                        "blood_group": blood_group,
                        "center_type": district_profile.center_type,
                        "current_stock_units": int(current_stock_units),
                        "expiring_72h_units": int(expiring_72h_units),
                        "issued_last_7d_units": int(issued_last_7d_units),
                        "collected_last_7d_units": int(collected_last_7d_units),
                        "hospital_occupancy_pct": round(float(hospital_occupancy_pct), 1),
                        "dengue_season_flag": dengue_season_flag,
                        "holiday_flag": holiday_flag,
                        "demand_next_7d_units": int(demand_next_7d_units),
                        "month": month,
                        "day_of_week": day_of_week,
                        "week_of_year": week_of_year,
                    }
                )

    return pd.DataFrame(records)


def main() -> None:
    ensure_directories()
    dataset = generate_synthetic_dataset()
    dataset.to_csv(DATASET_PATH, index=False)
    print(f"Saved synthetic dataset to {Path(DATASET_PATH)}")
    print(f"Rows generated: {len(dataset)}")


if __name__ == "__main__":
    main()
