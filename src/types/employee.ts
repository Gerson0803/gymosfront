export type EmployeeRole =
  | "trainer"
  | "receptionist"
  | "administrator"
  | "cleaning"
  | "nutritionist";

export type EmployeeStatus = "active" | "inactive";

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  role: EmployeeRole;
  schedule: string;
  salary: number;
  photoUrl: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
}

export type EmployeeFormData = Omit<Employee, "id" | "createdAt" | "updatedAt">;
