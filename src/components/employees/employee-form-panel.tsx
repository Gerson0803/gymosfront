"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import type { Employee, EmployeeFormData, EmployeeRole, EmployeeStatus } from "@/types/employee";
import { ROLE_LABELS } from "@/lib/employee-labels";
import { isScheduleComplete, parseSchedule } from "@/lib/schedule-utils";
import { premium } from "@/lib/premium-ui";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { SchedulePicker } from "@/components/ui/schedule-picker";

const EMPTY_FORM: EmployeeFormData = {
  employeeId: "",
  fullName: "",
  role: "trainer",
  schedule: "",
  salary: 0,
  photoUrl: "",
  email: "",
  phone: "",
  status: "active",
};

type EmployeeFormPanelProps = {
  open: boolean;
  editingEmployee: Employee | null;
  onClose: () => void;
  onSave: (data: EmployeeFormData) => void;
};

const inputClass =
  "w-full rounded-2xl border border-[#E5EAF3] bg-[#F5F7FB] px-4 py-2.5 text-sm text-[#0A1733] outline-none transition focus:border-[#0B57F0]/40 focus:ring-2 focus:ring-[#0B57F0]/10";

export function EmployeeFormPanel({
  open,
  editingEmployee,
  onClose,
  onSave,
}: EmployeeFormPanelProps) {
  const [form, setForm] = useState<EmployeeFormData>(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    if (editingEmployee) {
      const { id: _id, createdAt: _created, ...rest } = editingEmployee;
      setForm(rest);
    } else {
      setForm({
        ...EMPTY_FORM,
        employeeId: `EMP-${String(Date.now()).slice(-4)}`,
        schedule: "",
      });
    }
  }, [editingEmployee, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.employeeId.trim()) return;

    const scheduleValue = parseSchedule(form.schedule);
    if (!isScheduleComplete(scheduleValue) || !form.schedule.trim()) {
      toast.error("Selecciona al menos un día y el rango horario.");
      return;
    }

    onSave({
      ...form,
      fullName: form.fullName.trim(),
      employeeId: form.employeeId.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      photoUrl: form.photoUrl,
      salary: Number(form.salary) || 0,
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[#E5EAF3] bg-white shadow-2xl"
        role="dialog"
        aria-labelledby="employee-form-title"
      >
        <div className="flex items-center justify-between border-b border-[#E5EAF3] px-6 py-5">
          <h2 id="employee-form-title" className="text-xl font-semibold text-[#0A1733]">
            {editingEmployee ? "Editar empleado" : "Nuevo empleado"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#5B6475] transition hover:bg-[#F5F7FB] hover:text-[#0A1733]"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <PhotoUpload
              value={form.photoUrl}
              onChange={(photoUrl) => setForm({ ...form, photoUrl })}
              name={form.fullName || "Empleado"}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0A1733]">
                Nombre completo
              </label>
              <input
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className={inputClass}
                placeholder="Ej: Carlos Mendoza"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0A1733]">
                ID empleado
              </label>
              <input
                required
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                className={inputClass}
                placeholder="EMP-001"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0A1733]">Cargo</label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as EmployeeRole })
                  }
                  className={inputClass}
                >
                  {(Object.keys(ROLE_LABELS) as EmployeeRole[]).map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0A1733]">Estado</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as EmployeeStatus })
                  }
                  className={inputClass}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>

            <SchedulePicker
              value={form.schedule}
              onChange={(schedule) => setForm({ ...form, schedule })}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0A1733]">
                Salario (USD / mes)
              </label>
              <input
                required
                type="number"
                min={0}
                value={form.salary || ""}
                onChange={(e) =>
                  setForm({ ...form, salary: Number(e.target.value) })
                }
                className={inputClass}
                placeholder="2500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0A1733]">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
                placeholder="empleado@gymos.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0A1733]">Teléfono</label>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
                placeholder="+57 300 123 4567"
              />
            </div>
          </div>

          <div className="border-t border-[#E5EAF3] px-6 py-5">
            <button type="submit" className={`w-full ${premium.pillBtn}`}>
              {editingEmployee ? "Guardar cambios" : "Crear empleado"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
