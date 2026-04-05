import type { ClientStatus } from "@/types/client";

type StatusBadgeProps = {
  status: ClientStatus;
};

const statusMap: Record<ClientStatus, { label: string; classes: string }> = {
  active: {
    label: "Active",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  "at-risk": {
    label: "At Risk",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
  },
  inactive: {
    label: "Inactive",
    classes: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusMap[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
