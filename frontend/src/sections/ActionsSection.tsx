import { useEffect, useState } from "react";
import ActionCard from "../components/ActionCard";
import StatusBadge from "../components/StatusBadge";
import { ForecastInput, ForecastResult, RecommendationsResponse } from "../services/api";

interface ActionsSectionProps {
  forecastInput: ForecastInput;
  forecastResult: ForecastResult | null;
  getRecommendations: (params: {
    shortage_risk_tier: ForecastResult["shortage_risk_tier"];
    district: string;
    blood_group: string;
  }) => Promise<RecommendationsResponse>;
  onBackToForecast: () => void;
}

export default function ActionsSection({
  forecastInput,
  forecastResult,
  getRecommendations,
  onBackToForecast,
}: ActionsSectionProps) {
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadActions() {
      if (!forecastResult) {
        setRecommendations(null);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getRecommendations({
          shortage_risk_tier: forecastResult.shortage_risk_tier,
          district: forecastInput.district,
          blood_group: forecastInput.blood_group,
        });

        if (mounted) {
          setRecommendations(response);
        }
      } catch (requestError) {
        if (mounted) {
          setRecommendations(null);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Recommendations are currently unavailable. Check the backend connection and try again."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadActions();
    return () => {
      mounted = false;
    };
  }, [forecastInput, forecastResult, getRecommendations]);

  return (
    <section className="grid gap-6">
      {!forecastResult && (
        <div className="glass-panel p-8 sm:p-10">
          <p className="section-kicker">Actions</p>
          <h2 className="section-title mt-3">Recommendations will appear after the forecast runs</h2>
          <p className="section-copy mt-4">
            Run a forecast first to generate operational recommendations for redistribution, outreach, and district
            coordination.
          </p>
          <div className="mt-6">
            <button type="button" className="primary-button" onClick={onBackToForecast}>
              Start by entering current operational data
            </button>
          </div>
        </div>
      )}

      {forecastResult && (
        <div className="glass-panel p-6 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker">Actions</p>
              <h2 className="section-title mt-3">What should be done now?</h2>
              <p className="section-copy mt-3">
                These recommendations are generated based on predicted shortage conditions to support proactive
                coordination and resource allocation.
              </p>
            </div>
            <button type="button" className="secondary-button" onClick={onBackToForecast}>
              Refine Forecast Scenario
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#f6fbfb] px-4 py-2 text-sm font-medium text-slate-600">
              {forecastInput.district} - {forecastInput.blood_group}
            </span>
            <StatusBadge value={forecastResult.shortage_risk_tier} />
          </div>
        </div>
      )}

      {forecastResult && loading && (
        <div className="glass-panel p-6 text-sm text-slate-500">Generating the next best operational actions...</div>
      )}

      {forecastResult && error && <div className="glass-panel p-6 text-sm text-rose-700">{error}</div>}

      {forecastResult && !loading && recommendations && (
        <div className="grid gap-5 xl:grid-cols-3">
          {recommendations.actions.map((action) => (
            <ActionCard key={`${action.title}-${action.recommended_action}`} action={action} />
          ))}
        </div>
      )}

      {forecastResult && (
        <div className="glass-panel p-6">
          <p className="section-kicker">Decision Support Logic</p>
          <p className="mt-4 text-base leading-8 text-slate-700">
            These recommendations are generated based on predicted shortage conditions to support proactive
            coordination and resource allocation.
          </p>
        </div>
      )}
    </section>
  );
}
