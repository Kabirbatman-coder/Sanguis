import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import SummaryCard from "./components/SummaryCard";
import Tabs, { DashboardTab } from "./components/Tabs";
import {
  ForecastInput,
  ForecastResult,
  InventoryItem,
  SystemMode,
  getRecommendations,
  getSystemHealth,
  runForecast,
} from "./services/api";
import { demoForecastInput } from "./data/demo";
import InventorySection from "./sections/InventorySection";
import ForecastSection from "./sections/ForecastSection";
import ActionsSection from "./sections/ActionsSection";

const tabs: DashboardTab[] = [
  { id: "inventory", label: "Inventory", question: "What is happening now?" },
  { id: "forecast", label: "Forecast", question: "What shortage is coming?" },
  { id: "actions", label: "Actions", question: "What should be done now?" },
];

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab["id"]>("forecast");
  const [systemMode, setSystemMode] = useState<SystemMode>("checking");
  const [forecastInput, setForecastInput] = useState<ForecastInput>(demoForecastInput);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkSystemStatus() {
      const isHealthy = await getSystemHealth();
      if (mounted) {
        setSystemMode(isHealthy ? "online" : "offline");
      }
    }

    checkSystemStatus();
    return () => {
      mounted = false;
    };
  }, []);

  const inventorySnapshot = useMemo<InventoryItem[]>(() => {
    if (!forecastResult) {
      return [];
    }

    const riskToStatus = {
      low: "stable",
      medium: "watch",
      high: "critical",
      critical: "critical",
    } as const;

    return [
      {
        district: forecastInput.district,
        blood_group: forecastInput.blood_group,
        current_stock_units: forecastInput.current_stock_units,
        expiring_72h_units: forecastInput.expiring_72h_units,
        usable_stock: forecastResult.usable_stock,
        status: riskToStatus[forecastResult.shortage_risk_tier],
      },
    ];
  }, [forecastInput, forecastResult]);

  const districtOverview = useMemo(() => {
    if (!forecastResult) {
      return null;
    }

    const riskToStatus = {
      low: "stable",
      medium: "watch",
      high: "critical",
      critical: "critical",
    } as const;

    return {
      name: forecastInput.district,
      totalAvailableUnits: forecastInput.current_stock_units,
      expiringUnits: forecastInput.expiring_72h_units,
      mostAtRiskBloodGroup: forecastInput.blood_group,
      status: riskToStatus[forecastResult.shortage_risk_tier],
    };
  }, [forecastInput, forecastResult]);

  async function handleRunForecast(nextInput: ForecastInput) {
    const result = await runForecast(nextInput);
    setForecastInput(nextInput);
    setForecastResult(result);
    return result;
  }

  function handleEnterDashboard() {
    setShowDashboard(true);
    setActiveTab("forecast");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-canvas bg-hero-glow font-body text-ink">
      {!showDashboard ? (
        <LandingPage onStart={handleEnterDashboard} />
      ) : (
        <div className="page-enter mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
          <Header systemMode={systemMode} />

          {forecastResult && districtOverview && (
            <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4 transition-all duration-300">
              <SummaryCard
                title="Total Stock"
                value={`${forecastInput.current_stock_units} units`}
                hint={`${forecastInput.district} current stock position`}
                tone="neutral"
              />
              <SummaryCard
                title="Expiring Units"
                value={`${forecastInput.expiring_72h_units} units`}
                hint="Units approaching expiry within the next 72 hours"
                tone="warning"
              />
              <SummaryCard
                title="Forecasted Shortage"
                value={`${Math.max(0, forecastResult.shortage_gap).toFixed(1)} units`}
                hint="Projected 7-day shortage gap from the latest forecast"
                tone="critical"
              />
              <SummaryCard
                title="District Risk Level"
                value={forecastResult.shortage_risk_tier}
                hint={`${districtOverview.name} - blood group ${districtOverview.mostAtRiskBloodGroup}`}
                tone="accent"
              />
            </section>
          )}

          <div className="mt-8 rounded-[30px] border border-white/60 bg-white/70 p-3 shadow-panel backdrop-blur transition-all duration-300">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            <div className="mt-6">
              {activeTab === "inventory" && (
                <InventorySection
                  inventory={inventorySnapshot}
                  districtOverview={districtOverview}
                  hasForecastResult={Boolean(forecastResult)}
                  onContinue={() => setActiveTab("forecast")}
                />
              )}

              {activeTab === "forecast" && (
                <ForecastSection
                  defaultValues={forecastInput}
                  forecastResult={forecastResult}
                  onRunForecast={handleRunForecast}
                />
              )}

              {activeTab === "actions" && (
                <ActionsSection
                  forecastInput={forecastInput}
                  forecastResult={forecastResult}
                  getRecommendations={getRecommendations}
                  onBackToForecast={() => setActiveTab("forecast")}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
