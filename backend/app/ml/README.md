# ML Pipeline Notes

This folder contains the forecasting prototype for BloodFlow AI.

## Files

- `synth_data.py`: generates the synthetic blood-demand dataset
- `feature_config.py`: keeps feature lists in one place
- `evaluation.py`: computes beginner-friendly regression metrics
- `train_model.py`: trains candidate models, compares them, and saves the best one
- `predict.py`: loads the saved model and returns shortage intelligence
- `INTEGRATION_NOTE.md`: shows how a backend should call the prediction helper

## Run Order

1. Generate synthetic data
2. Train the model
3. Test a prediction

## Commands

```powershell
cd backend
py -m app.ml.synth_data
py -m app.ml.train_model
py -m app.ml.predict
```

## Output Files

- Dataset: `backend/data/synthetic_blood_timeseries.csv`
- Trained model: `backend/models/demand_model.joblib`
- Metrics: `backend/models/metrics.json`

## Notes

- If the dataset is missing, training will generate it automatically.
- If the model is missing, `predict.py` will trigger training automatically.
- This is designed for a hackathon demo, so the focus is clarity and believable patterns rather than production complexity.
