import api from './client';

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

export async function getActiveJobs(_token: string, _org: string) {
  const res = await api.get<ProductionJob[]>(`/production/active-jobs`);
  return res.data;
}

export async function updateJobStatus(_token: string, _org: string, id: string, status: string) {
  const res = await api.post<ProductionJob>(`/production/jobs/${id}/status`, { status });
  return res.data;
}
