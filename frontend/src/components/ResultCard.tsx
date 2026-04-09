interface ResultCardProps {
  title: string;
  value: string;
  highlight?: string;
}

export default function ResultCard({ title, value, highlight = "bg-white" }: ResultCardProps) {
  return (
    <div className={`rounded-[24px] border border-white/70 ${highlight} p-5 shadow-soft`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <p className="mt-4 font-display text-3xl text-ink">{value}</p>
    </div>
  );
}
