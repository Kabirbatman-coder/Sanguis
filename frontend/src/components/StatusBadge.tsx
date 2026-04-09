type BadgeTone = "stable" | "watch" | "critical" | "low" | "medium" | "high";

interface StatusBadgeProps {
  value: string;
}

const colorMap: Record<BadgeTone, string> = {
  stable: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  watch: "bg-amber-50 text-amber-700 ring-amber-200",
  critical: "bg-rose-50 text-rose-700 ring-rose-200",
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  high: "bg-orange-50 text-orange-700 ring-orange-200",
};

export default function StatusBadge({ value }: StatusBadgeProps) {
  const normalizedValue = value.toLowerCase() as BadgeTone;
  const classes = colorMap[normalizedValue] ?? "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${classes}`}>
      {value}
    </span>
  );
}
