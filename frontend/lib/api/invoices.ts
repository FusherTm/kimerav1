import api from './client';

export interface Invoice {
  id: string;
  partner_id?: string;
  invoice_number: string;
  issue_date: string;
  due_date?: string;
  amount: number;
  status?: string;
  notes?: string;
}

export interface InvoiceInput {
  partner_id?: string;
  invoice_number: string;
  issue_date: string;
  due_date?: string;
  amount: number;
  status?: string;
  notes?: string;
}

export async function listInvoices(params?: { start_date?: string; end_date?: string }) {
  const { data } = await api.get<Invoice[]>(`/invoices/`, { params });
  return data;
}

export async function createInvoice(payload: InvoiceInput) {
  const { data } = await api.post<Invoice>(`/invoices/`, payload);
  return data;
}

export async function getInvoiceSummary(params?: { start_date?: string; end_date?: string }) {
  const { data } = await api.get<{ total: number; by_month: { month: string; total: number }[] }>(`/invoices/summary`, { params });
  return data;
}

