import InventoryTable from "../components/InventoryTable";
import StatusBadge from "../components/StatusBadge";
import { DistrictOverview, InventoryItem } from "../services/api";

interface InventorySectionProps {
  inventory: InventoryItem[];
  districtOverview: DistrictOverview | null;
  hasForecastResult: boolean;
  onContinue: () => void;
}

export default function InventorySection({
  inventory,
  districtOverview,
  hasForecastResult,
  onContinue,
}: InventorySectionProps) {
  if (!hasForecastResult || !districtOverview) {
    return (
      <section className="grid gap-6">
        <div className="glass-panel p-8 sm:p-10">
          <p className="section-kicker">Inventory</p>
          <h2 className="section-title mt-3">Current operating picture will appear here</h2>
          <p className="section-copy mt-4">
            Start by entering current operational data in the Forecast tab. Once a forecast is run, this section will
            show the submitted stock position, expiry risk, and the blood group currently under the most pressure.
          </p>
          <div className="mt-6">
            <button type="button" className="primary-button" onClick={onContinue}>
              Start by entering current operational data
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="glass-panel p-6 sm:p-7">
        <p className="section-kicker">Inventory</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="section-title">What is happening now?</h2>
            <p className="section-copy mt-3">
              A district-level view of current stock, expiry risk, and at-risk blood groups.
            </p>
          </div>
          <button type="button" className="secondary-button" onClick={onContinue}>
            Continue to Forecast
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] bg-[#fff8f3] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">District</p>
            <p className="mt-3 font-display text-3xl">{districtOverview.name}</p>
          </div>
          <div className="rounded-[24px] bg-[#f6fbfb] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Most At-Risk Group</p>
            <p className="mt-3 font-display text-3xl">{districtOverview.mostAtRiskBloodGroup}</p>
          </div>
          <div className="rounded-[24px] bg-[#fff4f2] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">District Status</p>
            <div className="mt-3">
              <StatusBadge value={districtOverview.status} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <InventoryTable rows={inventory} />
        </div>
      </div>

      <div className="grid gap-6">
        <div className="glass-panel p-6">
          <p className="section-kicker">District Overview</p>
          <h3 className="mt-3 font-display text-3xl text-ink">{districtOverview.totalAvailableUnits} units available</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Current district availability after accounting for expiry risk and recent operational movement.
          </p>
          <div className="mt-5 rounded-[24px] bg-[#fff7ec] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Expiring within 72 hours</p>
            <p className="mt-3 font-display text-3xl text-wine">{districtOverview.expiringUnits} units</p>
          </div>
        </div>

        <div className="glass-panel p-6">
          <p className="section-kicker">Immediate Insight</p>
          <h3 className="mt-3 font-display text-3xl text-ink">Most at-risk blood group</h3>
          <div className="mt-5 rounded-[26px] bg-gradient-to-br from-[#fff2ee] to-[#ffe3db] p-5">
            <p className="font-display text-4xl text-wine">{districtOverview.mostAtRiskBloodGroup}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Lower available stock and higher recent pressure make this group the first priority for coordination
              review.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
