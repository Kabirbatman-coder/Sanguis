# ML Integration Note

## Function to Import

The backend should import:

```python
from app.ml.predict import predict_shortage
```

## Expected Input Shape

Pass a Python dictionary that looks like this:

```json
{
  "date": "2025-09-12",
  "state": "Maharashtra",
  "district": "Mumbai",
  "blood_group": "O-",
  "center_type": "Government",
  "current_stock_units": 24,
  "expiring_72h_units": 4,
  "issued_last_7d_units": 31,
  "collected_last_7d_units": 18,
  "hospital_occupancy_pct": 89,
  "dengue_season_flag": 1,
  "holiday_flag": 0
}
```

## Missing Field Behavior

- Missing fields are filled with safe hackathon defaults
- Invalid numeric values fall back to defaults
- `hospital_occupancy_pct` is clamped between `0` and `100`
- `dengue_season_flag` and `holiday_flag` are normalized to `0` or `1`
- If `date` is missing or invalid, today's date is used

## Returned Output

`predict_shortage(...)` returns:

```json
{
  "demand_next_7d_pred": 43.6,
  "usable_stock": 20,
  "shortage_gap": 23.6,
  "shortage_risk_tier": "critical",
  "model_name": "Ridge",
  "mae": 1.784
}
```

## Backend Usage Example

```python
payload = {
    "district": "Mumbai",
    "blood_group": "O-",
    "current_stock_units": 24,
    "expiring_72h_units": 4,
    "issued_last_7d_units": 31,
    "collected_last_7d_units": 18,
    "hospital_occupancy_pct": 89,
    "dengue_season_flag": 1,
    "holiday_flag": 0,
}

result = predict_shortage(payload)
```

This is ready to be returned directly from a FastAPI endpoint.
