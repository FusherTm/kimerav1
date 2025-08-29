import api from './client';

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
  _token: string,
  _org: string,
  params: { search?: string; skip?: number; limit?: number } = {}
) {
  const res = await api.get<Category[]>(`/categories/`, { params });
  return res.data;
}

export async function createCategory(_token: string, _org: string, data: CategoryInput) {
  const res = await api.post<Category>(`/categories/`, data);
  return res.data;
}

export async function getCategory(_token: string, _org: string, id: string) {
  const res = await api.get<Category>(`/categories/${id}`);
  return res.data;
}

export async function updateCategory(_token: string, _org: string, id: string, data: CategoryInput) {
  const res = await api.put<Category>(`/categories/${id}`, data);
  return res.data;
}

export async function deleteCategory(_token: string, _org: string, id: string) {
  await api.delete(`/categories/${id}`);
}
