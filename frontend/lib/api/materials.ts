import api from './client';

export interface Material {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  unit: string;
}

export interface MaterialCreateInput {
  name: string;
  sku: string;
  stock_quantity?: number;
  unit: string;
}

export interface MaterialUpdateInput {
  name?: string;
  sku?: string;
  stock_quantity?: number;
  unit?: string;
}

export async function getMaterials(): Promise<Material[]> {
  const { data } = await api.get<Material[]>(`/materials/`);
  return data;
}

export async function createMaterial(payload: MaterialCreateInput): Promise<Material> {
  const { data } = await api.post<Material>(`/materials/`, payload);
  return data;
}

export async function updateMaterial(id: string, payload: MaterialUpdateInput): Promise<Material> {
  const { data } = await api.put<Material>(`/materials/${id}`, payload);
  return data;
}

export async function deleteMaterial(id: string): Promise<{ ok: boolean }> {
  const { data } = await api.delete<{ ok: boolean }>(`/materials/${id}`);
  return data;
}

