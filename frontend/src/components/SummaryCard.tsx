interface SummaryCardProps {
  title: string;
  value: string;
  hint: string;
  tone: "neutral" | "warning" | "critical" | "accent";
}

const toneClasses: Record<SummaryCardProps["tone"], string> = {
  neutral: "from-white to-[#fbf7f3]",
  warning: "from-[#fff8ef] to-[#fff2d9]",
  critical: "from-[#fff3f1] to-[#ffe0dd]",
  accent: "from-[#eef7f6] to-[#def0ec]",
};

export default function SummaryCard({ title, value, hint, tone }: SummaryCardProps) {
  return (
    <article className={`rounded-[26px] border border-white/70 bg-gradient-to-br ${toneClasses[tone]} p-5 shadow-soft`}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
      <p className="mt-4 font-display text-3xl text-ink">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{hint}</p>
    </article>
  );
}
