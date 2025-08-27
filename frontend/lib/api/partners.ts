import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

export interface Partner {
  id: string;
  type: 'CUSTOMER' | 'SUPPLIER' | 'BOTH';
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  tax_number?: string;
}

export interface PartnerInput {
  type: 'CUSTOMER' | 'SUPPLIER' | 'BOTH';
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  tax_number?: string;
}

export async function listPartners(token: string, org: string, params: { type?: string; search?: string; skip?: number; limit?: number } = {}) {
  const res = await api.get<Partner[]>(`/partners`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function createPartner(token: string, org: string, data: PartnerInput) {
  const res = await api.post<Partner>(`/partners`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function getPartner(token: string, org: string, id: string) {
  const res = await api.get<Partner>(`/partners/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function updatePartner(token: string, org: string, id: string, data: PartnerInput) {
  const res = await api.put<Partner>(`/partners/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function deletePartner(token: string, org: string, id: string) {
  await api.delete(`/partners/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
}
