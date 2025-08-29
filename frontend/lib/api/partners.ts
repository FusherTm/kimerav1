import api from "./client";

export interface Partner {
  id: string;
  type: "CUSTOMER" | "SUPPLIER" | "BOTH";
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  tax_number?: string;
}

export interface PartnerInput {
  type: "CUSTOMER" | "SUPPLIER" | "BOTH";
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  tax_number?: string;
}

export async function listPartners(params?: any) {
  const { data } = await api.get<Partner[]>("/partners/", { params });
  return data;
}

export async function createPartner(payload: PartnerInput) {
  const { data } = await api.post<Partner>("/partners/", payload);
  return data;
}

export async function updatePartner(id: string | number, payload: PartnerInput) {
  const { data } = await api.put<Partner>(`/partners/${id}`, payload);
  return data;
}

export async function deletePartner(id: string | number) {
  const { data } = await api.delete(`/partners/${id}`);
  return data;
}

export async function getPartner(id: string | number) {
  const { data } = await api.get<Partner>(`/partners/${id}`);
  return data;
}

// New: partner orders and statement
export interface Order {
  id: string;
  partner_id?: string;
  order_number?: string;
  project_name?: string;
  status?: string;
  order_date?: string;
  grand_total?: number;
}

export interface StatementItem {
  id: string;
  transaction_date?: string;
  direction: 'IN' | 'OUT';
  amount: number;
  description?: string;
  document_name?: string;
  method?: string;
  area_sqm?: number;
}

export interface PartnerStatement {
  items: StatementItem[];
  summary: { incoming: number; outgoing: number; balance: number };
}

export async function getPartnerOrders(id: string) {
  const { data } = await api.get<Order[]>(`/partners/${id}/orders`);
  return data;
}

export async function getPartnerStatement(id: string, params?: { start_date?: string; end_date?: string }) {
  const { data } = await api.get<PartnerStatement>(`/partners/${id}/statement`, { params });
  return data;
}

