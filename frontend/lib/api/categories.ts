import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

export interface Category {
  id: string;
  name: string;
  code: string;
}

export interface CategoryInput {
  name: string;
  code: string;
}

export async function listCategories(
  token: string,
  org: string,
  params: { search?: string; skip?: number; limit?: number } = {}
) {
  const res = await api.get<Category[]>(`/categories`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function createCategory(token: string, org: string, data: CategoryInput) {
  const res = await api.post<Category>(`/categories`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function getCategory(token: string, org: string, id: string) {
  const res = await api.get<Category>(`/categories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function updateCategory(token: string, org: string, id: string, data: CategoryInput) {
  const res = await api.put<Category>(`/categories/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function deleteCategory(token: string, org: string, id: string) {
  await api.delete(`/categories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
}
