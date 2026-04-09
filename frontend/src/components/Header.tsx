import { SystemMode } from "../services/api";

interface HeaderProps {
  systemMode: SystemMode;
}

export default function Header({ systemMode }: HeaderProps) {
  const isOnline = systemMode === "online";
  const statusLabel = systemMode === "checking" ? "Checking System" : isOnline ? "System Online" : "Connection Limited";

  return (
    <header className="glass-panel relative overflow-hidden p-6 sm:p-8 lg:p-10">
      <div className="absolute inset-y-0 right-0 hidden w-[32%] bg-[radial-gradient(circle_at_top_right,rgba(240,107,120,0.35),transparent_45%),radial-gradient(circle_at_70%_50%,rgba(250,128,114,0.24),transparent_30%)] lg:block" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="section-kicker">District Coordination Platform</p>
          <h1 className="mt-3 font-display text-4xl leading-none text-ink sm:text-5xl lg:text-6xl">Sanguis</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            AI-powered blood supply coordination platform for proactive inventory planning and shortage prevention.
          </p>
        </div>

        <div className="relative rounded-[26px] border border-[#ead7ca] bg-white/90 p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${
                systemMode === "checking" ? "bg-gold" : isOnline ? "bg-emerald-500" : "bg-rose"
              }`}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Platform Status</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{statusLabel}</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
            Real-time operational signals are being processed to support district-level coordination decisions.
          </p>
        </div>
      </div>
    </header>
  );
}
