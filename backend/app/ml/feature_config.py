from __future__ import annotations


target_column = "demand_next_7d_units"

# These columns need categorical encoding because the model should treat them as labels, not numbers.
categorical_features = [
    "state",
    "district",
    "blood_group",
    "center_type",
]

# These columns can pass through as numeric signals.
numeric_features = [
    "current_stock_units",
    "expiring_72h_units",
    "issued_last_7d_units",
    "collected_last_7d_units",
    "hospital_occupancy_pct",
    "dengue_season_flag",
    "holiday_flag",
    "month",
    "day_of_week",
    "week_of_year",
]

model_input_features = categorical_features + numeric_features
