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
  const { data } = await api.get<Partner[]>("/partners", { params });
  return data;
}

export async function createPartner(payload: PartnerInput) {
  const { data } = await api.post<Partner>("/partners", payload);
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

