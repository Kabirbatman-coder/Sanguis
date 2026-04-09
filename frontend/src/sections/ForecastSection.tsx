import ForecastForm from "../components/ForecastForm";
import ResultCard from "../components/ResultCard";
import StatusBadge from "../components/StatusBadge";
import { ForecastInput, ForecastResult } from "../services/api";

interface ForecastSectionProps {
  defaultValues: ForecastInput;
  forecastResult: ForecastResult | null;
  onRunForecast: (values: ForecastInput) => Promise<ForecastResult>;
}

export default function ForecastSection({ defaultValues, forecastResult, onRunForecast }: ForecastSectionProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="glass-panel p-6 sm:p-7">
        {!forecastResult && (
          <div className="mb-6 rounded-[28px] bg-gradient-to-r from-[#fff8f4] via-[#fffaf7] to-[#fff1ee] p-6 shadow-soft">
            <p className="section-kicker">Operational Forecasting</p>
            <h2 className="section-title mt-3">Predict and prevent blood shortages</h2>
            <p className="section-copy mt-4">
              This system uses operational data such as current stock, usage patterns, and hospital demand to forecast
              short-term blood requirements and recommend actions.
            </p>
            <p className="mt-5 text-sm font-semibold text-wine">Start by entering current operational data.</p>
          </div>
        )}

        <p className="section-kicker">Forecast</p>
        <h2 className="section-title mt-3">What shortage is coming?</h2>
        <p className="section-copy mt-3">
          This model estimates short-term blood demand using current operational inputs and highlights potential
          shortage risk.
        </p>
        <div className="mt-6">
          <ForecastForm defaultValues={defaultValues} onSubmit={onRunForecast} />
        </div>
      </div>

      <div className="grid gap-6">
        <div className="glass-panel p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-kicker">Model Output</p>
              <h3 className="mt-3 font-display text-3xl text-ink">7-day shortage outlook</h3>
            </div>
          </div>

          {forecastResult ? (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <ResultCard title="Predicted Demand Next 7 Days" value={`${forecastResult.demand_next_7d_pred} units`} />
                <ResultCard title="Usable Stock" value={`${forecastResult.usable_stock} units`} highlight="bg-[#f6fbfb]" />
                <ResultCard title="Shortage Gap" value={`${forecastResult.shortage_gap} units`} highlight="bg-[#fff5ef]" />
                <ResultCard title="Risk Tier" value={forecastResult.shortage_risk_tier} highlight="bg-[#fff2ee]" />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <StatusBadge value={forecastResult.shortage_risk_tier} />
                <span className="rounded-full bg-[#f6f2ed] px-4 py-2 text-sm font-medium text-slate-600">
                  Model: {forecastResult.model_name}
                </span>
                <span className="rounded-full bg-[#f6f2ed] px-4 py-2 text-sm font-medium text-slate-600">
                  MAE: {forecastResult.mae}
                </span>
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-[24px] border border-dashed border-[#e7d8cc] bg-[#fffdfb] p-6 text-sm text-slate-500">
              Enter the current scenario and run the forecast to view predicted demand, usable stock, shortage gap, and
              risk tier.
            </div>
          )}
        </div>

        <div className="glass-panel p-6">
          <p className="section-kicker">Forecast Interpretation</p>
          <div className="mt-4 rounded-[26px] bg-gradient-to-r from-[#fffaf7] to-[#fff0ed] p-6">
            <p className="text-base leading-8 text-slate-700">
              This model estimates short-term blood demand using current operational inputs and highlights potential
              shortage risk.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
