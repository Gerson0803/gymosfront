import type { ClientStats } from "@/types/client";

type StatusDistributionProps = {
  stats: ClientStats;
};

function getWidth(value: number, total: number): string {
  if (total === 0) {
    return "0%";
  }

  return `${Math.max((value / total) * 100, 2)}%`;
}

export function StatusDistribution({ stats }: StatusDistributionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Client Status Distribution</h2>
        <p className="text-sm text-slate-500">Total: {stats.total}</p>
      </div>

      <div className="mb-5 h-4 overflow-hidden rounded-full bg-slate-100">
        <div className="flex h-full w-full">
          <div
            className="bg-emerald-500"
            style={{ width: getWidth(stats.active, stats.total) }}
            title="Active"
          />
          <div
            className="bg-amber-500"
            style={{ width: getWidth(stats.atRisk, stats.total) }}
            title="At Risk"
          />
          <div
            className="bg-rose-500"
            style={{ width: getWidth(stats.inactive, stats.total) }}
            title="Inactive"
          />
        </div>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">
          <p className="font-semibold">Active</p>
          <p>{stats.active} clients</p>
        </div>
        <div className="rounded-xl bg-amber-50 px-3 py-2 text-amber-700">
          <p className="font-semibold">At Risk</p>
          <p>{stats.atRisk} clients</p>
        </div>
        <div className="rounded-xl bg-rose-50 px-3 py-2 text-rose-700">
          <p className="font-semibold">Inactive</p>
          <p>{stats.inactive} clients</p>
        </div>
      </div>
    </section>
  );
}
