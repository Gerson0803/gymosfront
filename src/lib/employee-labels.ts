import type { EmployeeRole, EmployeeStatus } from "@/types/employee";

export const ROLE_LABELS: Record<EmployeeRole, string> = {
  trainer: "Entrenador",
  receptionist: "Recepcionista",
  administrator: "Administrador",
  cleaning: "Limpieza",
  nutritionist: "Nutricionista",
};

export const ROLE_FILTER_OPTIONS: { value: EmployeeRole | "all"; label: string }[] = [
  { value: "all", label: "Todos los cargos" },
  { value: "trainer", label: ROLE_LABELS.trainer },
  { value: "receptionist", label: ROLE_LABELS.receptionist },
  { value: "administrator", label: ROLE_LABELS.administrator },
  { value: "cleaning", label: ROLE_LABELS.cleaning },
  { value: "nutritionist", label: ROLE_LABELS.nutritionist },
];

export const STATUS_FILTER_OPTIONS: { value: EmployeeStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
];

export function formatSalary(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
