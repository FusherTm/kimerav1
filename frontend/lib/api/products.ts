import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

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
  token: string,
  org: string,
  params: { search?: string; category_id?: string; skip?: number; limit?: number } = {}
) {
  const res = await api.get<Product[]>(`/products`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function createProduct(token: string, org: string, data: ProductInput) {
  const res = await api.post<Product>(`/products`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function getProduct(token: string, org: string, id: string) {
  const res = await api.get<Product>(`/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function updateProduct(token: string, org: string, id: string, data: ProductInput) {
  const res = await api.put<Product>(`/products/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function deleteProduct(token: string, org: string, id: string) {
  await api.delete(`/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
}
