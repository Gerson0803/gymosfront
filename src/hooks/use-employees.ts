"use client";

import { useCallback, useMemo, useState } from "react";
import { INITIAL_EMPLOYEES } from "@/lib/mock-employees";
import type { Employee, EmployeeFormData } from "@/types/employee";

function generateId() {
  return `emp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  const addEmployee = useCallback((data: EmployeeFormData) => {
    const newEmployee: Employee = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setEmployees((prev) => [newEmployee, ...prev]);
    return newEmployee;
  }, []);

  const updateEmployee = useCallback((id: string, data: Partial<EmployeeFormData>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...data } : emp)),
    );
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  }, []);

  const getEmployeeById = useCallback(
    (id: string) => employees.find((emp) => emp.id === id),
    [employees],
  );

  const employeeCount = useMemo(() => employees.length, [employees]);

  return {
    employees,
    employeeCount,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
  };
}
