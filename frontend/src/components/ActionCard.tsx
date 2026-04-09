import { RecommendationAction } from "../services/api";
import StatusBadge from "./StatusBadge";

interface ActionCardProps {
  action: RecommendationAction;
}

export default function ActionCard({ action }: ActionCardProps) {
  const toneMap = {
    low: "from-white to-[#f8fbfa]",
    medium: "from-[#fff8ef] to-[#fff3de]",
    high: "from-[#fff6ef] to-[#ffe6d6]",
    critical: "from-[#fff1ef] to-[#ffe0dc]",
  };

  return (
    <article
      className={`rounded-[26px] border border-white/70 bg-gradient-to-br ${toneMap[action.shortage_risk_tier]} p-6 shadow-soft`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{action.priority} priority</p>
          <h3 className="mt-3 font-display text-2xl text-ink">{action.title}</h3>
        </div>
        <StatusBadge value={action.shortage_risk_tier} />
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600">{action.description}</p>
      <div className="mt-5 rounded-[20px] border border-white/75 bg-white/70 px-4 py-3 text-sm font-medium text-slate-700">
        {action.recommended_action}
      </div>
    </article>
  );
}
