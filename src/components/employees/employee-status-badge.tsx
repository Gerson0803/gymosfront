import type { EmployeeStatus } from "@/types/employee";

type EmployeeStatusBadgeProps = {
  status: EmployeeStatus;
};

export function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`}
        aria-hidden
      />
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
}
