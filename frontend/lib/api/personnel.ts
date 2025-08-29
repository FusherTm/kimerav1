import api from './client';

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  hire_date?: string;
  salary?: number;
  insurance?: number;
  is_active: boolean;
  notes?: string;
}

export interface EmployeeInput extends Omit<Employee, 'id' | 'is_active'> {}

export async function listEmployees(params?: { only_active?: boolean }) {
  const { data } = await api.get<Employee[]>(`/personnel/employees`, { params });
  return data;
}

export async function createEmployee(payload: EmployeeInput) {
  const { data } = await api.post<Employee>(`/personnel/employees`, payload);
  return data;
}

export async function updateEmployee(id: string, payload: EmployeeInput) {
  const { data } = await api.put<Employee>(`/personnel/employees/${id}`, payload);
  return data;
}

export async function deleteEmployee(id: string) {
  await api.delete(`/personnel/employees/${id}`);
}

export async function getPersonnelSummary(params?: { year?: number }) {
  const { data } = await api.get(`/personnel/summary`, { params });
  return data as { year: number; total_employees: number; total_salary: number; total_insurance: number; leaves: Record<string, number> };
}

export async function createLeave(payload: { employee_id: string; start_date: string; end_date: string; days: number; leave_type?: string; note?: string; }) {
  const { data } = await api.post(`/personnel/leaves`, payload);
  return data;
}

export async function listLeaves(params?: { employee_id?: string; year?: number }) {
  const { data } = await api.get(`/personnel/leaves`, { params });
  return data as Array<{ id: string; employee_id: string; start_date: string; end_date: string; days: number; leave_type?: string; note?: string }>;
}

export async function getEmployee(id: string) {
  const { data } = await api.get<Employee>(`/personnel/employees/${id}`);
  return data;
}

export async function restoreEmployee(id: string) {
  const { data } = await api.post(`/personnel/employees/${id}/restore`, {});
  return data;
}

export async function getPersonnelMonthly(params?: { year?: number }) {
  const { data } = await api.get(`/personnel/monthly`, { params });
  return data as { year: number; months: Array<{ month: number; salary_total: number; insurance_total: number }> };
}
