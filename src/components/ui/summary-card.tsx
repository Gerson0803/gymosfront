import type { LucideIcon } from "lucide-react";

type SummaryCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "default" | "active" | "risk" | "inactive";
};

const toneStyles = {
  default: "from-slate-700 to-slate-900",
  active: "from-emerald-500 to-emerald-700",
  risk: "from-amber-500 to-amber-700",
  inactive: "from-rose-500 to-rose-700",
};

export function SummaryCard({ label, value, icon: Icon, tone }: SummaryCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white ${toneStyles[tone]}`}
        >
          <Icon size={18} />
        </div>
      </div>
    </article>
  );
}
