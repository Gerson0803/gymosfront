"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createEmployee,
  deleteEmployeeApi,
  getEmployees,
  updateEmployeeApi,
} from "@/lib/api";
import type { Employee, EmployeeFormData } from "@/types/employee";

type EmployeesApiResponse =
  | Employee[]
  | {
      data?: Employee[] | { employees?: Employee[]; items?: Employee[] };
      employees?: Employee[];
      items?: Employee[];
    };

type EmployeeMutationResponse = Employee | { data?: Employee };

function isEmployee(value: unknown): value is Employee {
  return Boolean(
    value &&
      typeof value === "object" &&
      "id" in value &&
      "employeeId" in value &&
      "fullName" in value,
  );
}

function normalizeEmployeesResponse(response: EmployeesApiResponse): Employee[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.employees)) return response.data.employees;
  if (Array.isArray(response.data?.items)) return response.data.items;
  if (Array.isArray(response.employees)) return response.employees;
  if (Array.isArray(response.items)) return response.items;
  return [];
}

function normalizeEmployeeMutationResponse(response: EmployeeMutationResponse): Employee | null {
  if (isEmployee(response)) return response;
  if (isEmployee(response.data)) return response.data;
  return null;
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getEmployees() as EmployeesApiResponse;
      setEmployees(normalizeEmployeesResponse(response));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar empleados";
      setError(errorMessage);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const addEmployee = useCallback(async (data: EmployeeFormData) => {
    const response = await createEmployee(data as unknown as Record<string, unknown>) as EmployeeMutationResponse;
    const newEmployee = normalizeEmployeeMutationResponse(response);
    if (!newEmployee) {
      await loadEmployees();
      return null;
    }
    setEmployees((prev) => [newEmployee, ...prev]);
    return newEmployee;
  }, [loadEmployees]);

  const updateEmployee = useCallback(async (id: string, data: Partial<EmployeeFormData>) => {
    const response = await updateEmployeeApi(id, data as Record<string, unknown>) as Employee | { data?: Employee };
    const updatedEmployee = normalizeEmployeeMutationResponse(response);
    if (!updatedEmployee) {
      await loadEmployees();
      return;
    }
    setEmployees((prev) => prev.map((emp) => (emp.id === id ? updatedEmployee : emp)));
  }, [loadEmployees]);

  const deleteEmployee = useCallback(async (id: string) => {
    await deleteEmployeeApi(id);
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  }, []);


  const getEmployeeById = useCallback(
    (id: string) => employees.find((emp) => emp.id === id),
    [employees],
  );

  const employeeCount = useMemo(() => employees.length, [employees]);

  return {
    employees,
    loading,
    error,
    employeeCount,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
  };
}
