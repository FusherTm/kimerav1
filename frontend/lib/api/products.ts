import api from './client';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category_id?: string;
  base_price_sqm?: number;
}

export interface ProductInput {
  name: string;
  sku: string;
  category_id?: string;
  base_price_sqm?: number;
}

export async function listProducts(
  _token: string,
  _org: string,
  params: { search?: string; category_id?: string; skip?: number; limit?: number } = {}
) {
  const res = await api.get<Product[]>(`/products/`, { params });
  return res.data;
}

export async function createProduct(_token: string, _org: string, data: ProductInput) {
  const res = await api.post<Product>(`/products/`, data);
  return res.data;
}

export async function getProduct(_token: string, _org: string, id: string) {
  const res = await api.get<Product>(`/products/${id}`);
  return res.data;
}

export async function updateProduct(_token: string, _org: string, id: string, data: ProductInput) {
  const res = await api.put<Product>(`/products/${id}`, data);
  return res.data;
}

export async function deleteProduct(_token: string, _org: string, id: string) {
  await api.delete(`/products/${id}`);
}
