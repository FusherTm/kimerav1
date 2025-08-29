import api from './client';

export interface Asset {
  id: string;
  name: string;
  asset_type: string;
  acquisition_date?: string;
  current_value?: number;
  status?: string;
  check_detail?: {
    partner_id?: string;
    check_number?: string;
    due_date?: string;
    amount?: number;
    status?: string;
    bank_name?: string;
    bank_branch?: string;
    given_to_partner_id?: string;
    given_to_name?: string;
  };
}

export interface AssetCreateInput {
  name: string;
  asset_type: 'VEHICLE' | 'REAL_ESTATE' | 'CHECK' | string;
  acquisition_date?: string;
  current_value?: number;
  status?: string;
  details: Record<string, any>;
}

export async function listAssets() {
  const { data } = await api.get<Asset[]>(`/assets/`);
  return data;
}

export async function createAsset(payload: AssetCreateInput) {
  const { data } = await api.post<Asset>(`/assets/`, payload);
  return data;
}

export async function deleteAsset(id: string) {
  await api.delete(`/assets/${id}`);
}

export async function updateCheckStatus(assetId: string, status: string, given_to_partner_id?: string, given_to_name?: string) {
  const { data } = await api.patch<Asset>(`/assets/${assetId}/check-status`, { status, given_to_partner_id, given_to_name });
  return data;
}
