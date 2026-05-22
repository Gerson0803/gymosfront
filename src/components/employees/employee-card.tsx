"use client";

import { Mail, Phone, Clock, Briefcase, DollarSign, Pencil, Trash2 } from "lucide-react";
import type { Employee } from "@/types/employee";
import { EmployeeStatusBadge } from "./employee-status-badge";
import { ROLE_LABELS, formatSalary } from "@/lib/employee-labels";
import { premium } from "@/lib/premium-ui";
import { ProfileAvatar } from "@/components/ui/profile-avatar";

type EmployeeCardProps = {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
};

export function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  return (
    <article
      className={`group overflow-hidden ${premium.card} transition hover:shadow-[0_8px_32px_-8px_rgba(10,23,51,0.1)]`}
    >
      <div className="grid grid-cols-1 items-center gap-6 p-5 sm:p-6 lg:grid-cols-[auto_minmax(0,1.2fr)_repeat(4,minmax(0,1fr))_auto]">
        <ProfileAvatar
          photoUrl={employee.photoUrl}
          name={employee.fullName}
          size="md"
        />

        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-[#0A1733]">{employee.fullName}</p>
          <p className="mt-0.5 font-mono text-xs text-[#5B6475]">{employee.employeeId}</p>
        </div>

        <div>
          <p className={premium.labelCaps}>Cargo</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#0A1733]">
            <Briefcase className="h-3.5 w-3.5 text-[#0B57F0]" strokeWidth={1.75} />
            {ROLE_LABELS[employee.role]}
          </p>
        </div>

        <div>
          <p className={premium.labelCaps}>Horario</p>
          <p className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-[#0A1733]">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5B6475]" strokeWidth={1.75} />
            <span className="line-clamp-2">{employee.schedule}</span>
          </p>
        </div>

        <div>
          <p className={premium.labelCaps}>Salario</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#0A1733]">
            <DollarSign className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
            {formatSalary(employee.salary)}
          </p>
        </div>

        <div>
          <p className={premium.labelCaps}>Contacto</p>
          <p className="mt-1.5 flex items-center gap-1 text-xs text-[#5B6475]">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{employee.email}</span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-[#5B6475]">
            <Phone className="h-3 w-3 shrink-0" />
            <span>{employee.phone}</span>
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <EmployeeStatusBadge status={employee.status} />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-[#E5EAF3] px-5 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => onEdit(employee)}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-[#0B57F0] transition hover:bg-[#0B57F0]/5"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(employee.id)}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </button>
      </div>
    </article>
  );
}
