import { FormEvent, useState } from "react";
import { ForecastInput } from "../services/api";

interface ForecastFormProps {
  defaultValues: ForecastInput;
  onSubmit: (values: ForecastInput) => Promise<unknown>;
}

export default function ForecastForm({ defaultValues, onSubmit }: ForecastFormProps) {
  const [formValues, setFormValues] = useState<ForecastInput>(defaultValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof ForecastInput, value: string) {
    const textFields: Array<keyof ForecastInput> = ["date", "state", "district", "blood_group", "center_type"];

    if (textFields.includes(field)) {
      setFormValues((current) => ({ ...current, [field]: value }));
      return;
    }

    setFormValues((current) => ({ ...current, [field]: Number(value) }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formValues);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to run forecast right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-600">
          Date
          <input className="input-shell" value={formValues.date} onChange={(event) => updateField("date", event.target.value)} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-600">
          District
          <input
            className="input-shell"
            value={formValues.district}
            onChange={(event) => updateField("district", event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-600">
          Blood Group
          <input
            className="input-shell"
            value={formValues.blood_group}
            onChange={(event) => updateField("blood_group", event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-600">
          Current Stock
          <input
            className="input-shell"
            type="number"
            value={formValues.current_stock_units}
            onChange={(event) => updateField("current_stock_units", event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-600">
          Past Usage
          <input
            className="input-shell"
            type="number"
            value={formValues.issued_last_7d_units}
            onChange={(event) => updateField("issued_last_7d_units", event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-600">
          Collection Data
          <input
            className="input-shell"
            type="number"
            value={formValues.collected_last_7d_units}
            onChange={(event) => updateField("collected_last_7d_units", event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-600">
          Hospital Load
          <input
            className="input-shell"
            type="number"
            value={formValues.hospital_occupancy_pct}
            onChange={(event) => updateField("hospital_occupancy_pct", event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-600">
          Expiring Units
          <input
            className="input-shell"
            type="number"
            value={formValues.expiring_72h_units}
            onChange={(event) => updateField("expiring_72h_units", event.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-600">
          Seasonal Signal
          <select
            className="input-shell"
            value={formValues.dengue_season_flag}
            onChange={(event) => updateField("dengue_season_flag", event.target.value)}
          >
            <option value={0}>Normal period</option>
            <option value={1}>Dengue pressure</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-600">
          Center Type
          <select
            className="input-shell"
            value={formValues.center_type}
            onChange={(event) => updateField("center_type", event.target.value)}
          >
            <option value="Government">Government</option>
            <option value="Hospital">Hospital</option>
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Running Forecast..." : "Run Forecast"}
        </button>
        <p className="text-sm leading-6 text-slate-500">
          The model transforms live operational inputs into a 7-day shortage signal before the district hits crisis.
        </p>
      </div>

      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
    </form>
  );
}
