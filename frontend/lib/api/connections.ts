import api from './client';

export interface Connection {
  id: string;
  partner_id: string;
  total_amount: number;
  remaining_amount: number;
  date?: string;
  method?: string;
  description?: string;
  status?: string;
}

export interface ConnectionCreate {
  partner_id: string;
  total_amount: number;
  date?: string;
  method?: string;
  description?: string;
}

export interface ConnectionApplication {
  id: string;
  connection_id: string;
  order_id: string;
  amount: number;
}

export async function createConnection(payload: ConnectionCreate) {
  const { data } = await api.post<Connection>('/connections/', payload);
  return data;
}

export async function listOpenConnections(partnerId: string) {
  const { data } = await api.get<Connection[]>(`/connections`, { params: { partner_id: partnerId, status: 'OPEN' } });
  return data;
}

export async function listConnections(partnerId?: string, status?: string) {
  const params: any = {};
  if (partnerId) params.partner_id = partnerId;
  if (status) params.status = status;
  const { data } = await api.get<Connection[]>(`/connections`, { params });
  return data;
}

export async function getOrderConnection(orderId: string) {
  const { data } = await api.get<ConnectionApplication | null>(`/connections/orders/${orderId}/application`);
  return data;
}

export async function applyConnection(connectionId: string, orderId: string, amount: number) {
  const { data } = await api.post<ConnectionApplication>(`/connections/${connectionId}/apply`, {
    connection_id: connectionId,
    order_id: orderId,
    amount,
  });
  return data;
}
