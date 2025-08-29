import api from './client';

export interface MyPermissions {
  organization: { id: string; name: string; slug: string };
  role: string;
  is_admin: boolean;
  permissions: Record<string, boolean>;
  user: { id: string; email: string };
}

export async function getMyPermissions() {
  const { data } = await api.get<MyPermissions>('/me/permissions');
  return data;
}

