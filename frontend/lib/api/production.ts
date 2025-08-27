import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

export interface ProductionJob {
  id: string;
  status: string;
  order_number?: string;
  partner_name?: string;
  product_name?: string;
  width?: number;
  height?: number;
  quantity?: number;
}

export async function getActiveJobs(token: string, org: string) {
  const res = await api.get<ProductionJob[]>(`/production/active-jobs`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function updateJobStatus(token: string, org: string, id: string, status: string) {
  const res = await api.post<ProductionJob>(`/production/jobs/${id}/status`, { status }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}
