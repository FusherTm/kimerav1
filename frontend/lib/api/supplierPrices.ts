import api from './client';

export interface SupplierPrice {
  id: string;
  supplier_id: string;
  product_id: string;
  unit_price: number;
}

export interface SupplierPriceInput {
  supplier_id: string;
  product_id: string;
  unit_price: number;
}

export async function upsertSupplierPrice(data: SupplierPriceInput) {
  const res = await api.post<SupplierPrice>(`/supplier_prices/`, data);
  return res.data;
}

export async function fetchSupplierPrice(supplier_id: string, product_id: string) {
  const res = await api.get<SupplierPrice>(`/supplier_prices/search`, { params: { supplier_id, product_id } });
  return res.data;
}

