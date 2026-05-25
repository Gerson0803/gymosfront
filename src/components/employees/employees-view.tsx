"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/layout/page-header";
import { premium } from "@/lib/premium-ui";
import { useEmployees } from "@/hooks/use-employees";
import { ROLE_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from "@/lib/employee-labels";
import type { Employee, EmployeeFormData, EmployeeRole, EmployeeStatus } from "@/types/employee";
import { EmployeeCard } from "./employee-card";
import { EmployeeFormPanel } from "./employee-form-panel";

export default function EmployeesView() {
  const { employees, loading, error, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<EmployeeRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | "all">("all");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredEmployees = useMemo(() => {
    const q = search.toLowerCase().trim();
    return employees.filter((emp) => {
      const matchesSearch =
        !q ||
        emp.fullName.toLowerCase().includes(q) ||
        emp.employeeId.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.phone.includes(q);
      const matchesRole = roleFilter === "all" || emp.role === roleFilter;
      const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, search, roleFilter, statusFilter]);

  const openCreate = () => {
    setEditingEmployee(null);
    setPanelOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingEmployee(null);
  };

  const handleSave = async (data: EmployeeFormData) => {
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, data);
        toast.success("Empleado actualizado");
      } else {
        await addEmployee(data);
        toast.success("Empleado creado");
      }
      closePanel();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar empleado");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEmployee(id);
      toast.success("Empleado eliminado");
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar empleado");
    }
  };

  const selectClass =
    "rounded-full border border-[#E5EAF3] bg-white py-2.5 pl-10 pr-8 text-sm font-medium text-[#0A1733] outline-none transition focus:border-[#0B57F0]/40 focus:ring-2 focus:ring-[#0B57F0]/10";

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        title="Employees"
        search={
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B6475]" />
            <input
              type="text"
              placeholder="Buscar por nombre, ID, email o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={premium.searchInput}
            />
          </div>
        }
        actions={
          <button type="button" onClick={openCreate} className={premium.pillBtn}>
            <Plus className="h-4 w-4" />
            Nuevo Empleado
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B6475]" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as EmployeeRole | "all")}
            className={`${selectClass} w-full`}
          >
            {ROLE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EmployeeStatus | "all")}
            className={`${selectClass} w-full pl-4`}
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <p className="flex items-center text-sm text-[#5B6475] sm:ml-auto">
          {filteredEmployees.length} empleado{filteredEmployees.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-4">
        {error && (
          <div className={`${premium.card} border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700`}>
            {error}
          </div>
        )}

        {loading && (
          <div className={`${premium.card} py-16 text-center`}>
            <p className="text-sm text-[#5B6475]">Cargando empleados...</p>
          </div>
        )}

        {!loading && !error && filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onEdit={openEdit}
            onDelete={setDeleteConfirmId}
          />
        ))}

        {!loading && !error && filteredEmployees.length === 0 && (
          <div className={`${premium.card} py-16 text-center`}>
            <p className="text-sm text-[#5B6475]">No hay empleados que coincidan con los filtros.</p>
          </div>
        )}
      </div>

      <EmployeeFormPanel
        open={panelOpen}
        editingEmployee={editingEmployee}
        onClose={closePanel}
        onSave={handleSave}
      />

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`${premium.card} w-full max-w-md p-6`}>
            <h3 className="text-lg font-semibold text-[#0A1733]">¿Eliminar empleado?</h3>
            <p className="mt-2 text-sm text-[#5B6475]">Esta acción no se puede deshacer.</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className={`flex-1 ${premium.pillBtnOutline}`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
