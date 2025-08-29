import api from './client';

export interface Account {
  id: string;
  name: string;
  type: string;
  current_balance: number;
}

export interface AccountInput {
  name: string;
  type: 'CASH' | 'BANK';
  current_balance?: number;
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

export interface Transaction {
  id: string;
  account_id?: string | null;
  partner_id?: string | null;
  direction: 'IN' | 'OUT' | string;
  amount: number;
  transaction_date?: string | null;
  description?: string | null;
  method?: string | null;
}

export async function getAccounts(_token: string, _org: string) {
  const res = await api.get<Account[]>(`/accounts/`);
  return res.data;
}

export async function recordTransaction(_token: string, _org: string, data: TransactionInput) {
  const res = await api.post(`/financial_transactions/`, data);
  return res.data;
}

export async function createAccount(_token: string, _org: string, data: AccountInput) {
  const res = await api.post<Account>(`/accounts/`, data);
  return res.data;
}

export async function getRecentTransactions(limit = 10) {
  const res = await api.get<Transaction[]>(`/financial_transactions/`, { params: { limit } });
  return res.data;
}
