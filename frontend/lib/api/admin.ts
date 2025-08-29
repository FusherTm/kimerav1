import api from './client';

export async function listRoles() {
  const { data } = await api.get<Array<{ name: string; permissions: Record<string, boolean> }>>('/roles/');
  return data;
}

export async function createRole(name: string, permissions: Record<string, boolean> = {}) {
  const { data } = await api.post('/roles/', { name, permissions });
  return data;
}

export async function updateRole(name: string, permissions: Record<string, boolean>) {
  const { data } = await api.put(`/roles/${name}`, { permissions });
  return data;
}

export async function deleteRole(name: string) {
  await api.delete(`/roles/${name}`);
}

export async function listOrgUsers() {
  const { data } = await api.get<Array<{ user_id: string; email: string; role: string }>>('/org-users/');
  return data;
}

export async function assignUserRole(user_id: string, role: string) {
  const { data } = await api.patch(`/org-users/${user_id}`, { role });
  return data;
}

export async function createOrgUser(payload: { email: string; password: string; role: string }) {
  const { data } = await api.post(`/org-users/`, payload);
  return data;
}

export async function createTenant(payload: { name: string; slug: string; admin_email?: string; admin_password?: string }) {
  const { data } = await api.post(`/tenants/`, payload);
  return data;
}
