import { useRef } from "react";

interface LandingPageProps {
  onStart: () => void;
}

const steps = [
  {
    step: "Step 1",
    title: "Input operational data",
    description: "Enter current stock levels, usage trends, hospital demand, and collection signals.",
  },
  {
    step: "Step 2",
    title: "Predict demand",
    description: "The system estimates blood demand for the next 7 days.",
  },
  {
    step: "Step 3",
    title: "Take action",
    description: "Receive recommendations for redistribution, donor outreach, and coordination.",
  },
];

export default function LandingPage({ onStart }: LandingPageProps) {
  const howItWorksRef = useRef<HTMLElement | null>(null);

  function handleLearnMore() {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
      <section className="glass-panel relative overflow-hidden p-8 sm:p-10 lg:p-14">
        <div className="absolute inset-y-0 right-0 hidden w-[40%] bg-[radial-gradient(circle_at_20%_30%,rgba(240,107,120,0.22),transparent_30%),radial-gradient(circle_at_80%_40%,rgba(43,111,119,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0))] lg:block" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="section-kicker">Proactive Blood Coordination Platform</p>
            <h1 className="mt-4 font-display text-5xl leading-none text-ink sm:text-6xl lg:text-7xl">Sanguis</h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-700">
              Predict and prevent blood shortages using real-time operational signals
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Turn fragmented blood inventory data into proactive coordination decisions across districts.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" className="primary-button" onClick={onStart}>
                Start Forecast
              </button>
              <button type="button" className="secondary-button" onClick={handleLearnMore}>
                Learn how it works
              </button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute -left-6 top-10 h-24 w-24 rounded-full bg-rose/20 blur-2xl" />
            <div className="absolute -right-2 bottom-8 h-28 w-28 rounded-full bg-lagoon/15 blur-2xl" />
            <div className="relative rounded-[34px] border border-white/70 bg-white/85 p-5 shadow-panel backdrop-blur">
              <div className="rounded-[28px] bg-gradient-to-br from-[#fff9f7] via-[#fffdfb] to-[#f5fbfb] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Live operations</p>
                    <h2 className="mt-2 font-display text-2xl text-ink">District signal preview</h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    Active
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] bg-[#fff3ef] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Forecast gap</p>
                    <p className="mt-3 font-display text-3xl text-wine">13.7</p>
                  </div>
                  <div className="rounded-[22px] bg-[#eef7f6] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Risk tier</p>
                    <p className="mt-3 font-display text-3xl text-lagoon">High</p>
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-[#efe0d5] bg-white p-4">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Stock visibility</span>
                    <span>Bengaluru Urban</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-2xl bg-[#fff8f3] px-4 py-3">
                      <span className="font-medium text-slate-700">O+</span>
                      <span className="text-sm text-slate-600">76 units</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-[#fff7ec] px-4 py-3">
                      <span className="font-medium text-slate-700">A+</span>
                      <span className="text-sm text-slate-600">51 units</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-[#fff1ef] px-4 py-3">
                      <span className="font-medium text-slate-700">B-</span>
                      <span className="text-sm font-semibold text-rose-700">Critical</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={howItWorksRef} className="mt-8 grid gap-5 md:grid-cols-3">
        {steps.map((item) => (
          <article key={item.step} className="glass-panel page-enter p-6 sm:p-7">
            <p className="section-kicker">{item.step}</p>
            <h3 className="mt-4 font-display text-3xl text-ink">{item.title}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel p-8 sm:p-10">
          <p className="section-kicker">Why this matters</p>
          <h2 className="section-title mt-4">Shortages and wastage often happen at the same time</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            Blood shortages and wastage often happen at the same time due to lack of coordination and visibility. This
            platform enables proactive planning by forecasting demand and triggering early actions.
          </p>
        </div>

        <div className="glass-panel flex flex-col justify-between p-8 sm:p-10">
          <div>
            <p className="section-kicker">Coordination outcome</p>
            <h3 className="mt-4 font-display text-4xl text-ink">From fragmented signals to decisive action</h3>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              Sanguis helps teams move from raw operational inputs to shortage prediction and coordinated action without
              losing clarity.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-slate-600">Ready for district-level planning</span>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[34px] bg-gradient-to-r from-wine via-rose to-coral px-8 py-10 text-center text-white shadow-panel sm:px-12">
        <p className="section-kicker !text-white/70">Next step</p>
        <h2 className="mt-4 font-display text-4xl sm:text-5xl">Start forecasting now</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/85">
          Open the dashboard, enter the current district scenario, and move directly from prediction to action.
        </p>
        <button type="button" className="mt-8 inline-flex rounded-full bg-white px-7 py-3 text-sm font-semibold text-wine transition hover:-translate-y-0.5" onClick={onStart}>
          Go to Dashboard
        </button>
      </section>
    </div>
  );
}
