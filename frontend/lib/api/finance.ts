import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

export interface Account {
  id: string;
  name: string;
  type: string;
  current_balance: number;
}

export interface TransactionInput {
  account_id: string;
  partner_id?: string;
  direction: 'IN' | 'OUT';
  amount: number;
  transaction_date?: string;
  description?: string;
  method?: string;
}

export async function getAccounts(token: string, org: string) {
  const res = await api.get<Account[]>(`/accounts`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function recordTransaction(token: string, org: string, data: TransactionInput) {
  const res = await api.post(`/financial_transactions`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}
