import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

export interface DashboardSummary {
  total_balance: number;
  active_jobs: number;
  waiting_orders: number;
  total_customers: number;
}

export async function getDashboardSummary(token: string, org: string) {
  const res = await api.get<DashboardSummary>(`/dashboard/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}
