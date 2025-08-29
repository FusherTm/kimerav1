import api from './client';

export interface DashboardSummary {
  total_balance: number;
  total_receivables: number;
  total_payables: number;
  recent_transactions: Array<{ id: string; transaction_date?: string | null; direction: 'IN' | 'OUT' | string; amount: number; description?: string | null; method?: string | null; partner_id?: string | null }>;
  active_jobs: number;
  jobs_by_status: Record<string, number>;
  jobs_by_station?: Record<string, number>;
  todays_deliveries: Array<{ id: string; order_number?: string | null; partner_name?: string | null }>;
  cash_flow_7d?: number[];
}

export async function getDashboardSummary(_token: string, _org: string) {
  const res = await api.get<DashboardSummary>(`/dashboard/summary`);
  return res.data;
}
