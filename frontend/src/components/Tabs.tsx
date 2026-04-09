export interface DashboardTab {
  id: "inventory" | "forecast" | "actions";
  label: string;
  question: string;
}

interface TabsProps {
  tabs: DashboardTab[];
  activeTab: DashboardTab["id"];
  onChange: (tabId: DashboardTab["id"]) => void;
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-[24px] border px-5 py-4 text-left transition ${
              isActive
                ? "border-transparent bg-gradient-to-r from-wine via-rose to-coral text-white shadow-soft"
                : "border-[#eadfd6] bg-[#fffdfa] text-slate-700 hover:border-rose/30 hover:bg-white"
            }`}
          >
            <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isActive ? "text-white/75" : "text-slate-500"}`}>
              {tab.label}
            </p>
            <p className="mt-2 text-sm font-medium">{tab.question}</p>
          </button>
        );
      })}
    </div>
  );
}
