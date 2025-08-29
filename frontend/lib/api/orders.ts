import api from './client';

export interface Order {
  id: string;
  partner_id?: string;
  project_name?: string;
  order_number?: string;
  status?: string;
  order_date?: string;
  delivery_date?: string;
  delivery_method?: string;
  notes?: string;
  grand_total?: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  description?: string;
  area_sqm?: number;
  width?: number;
  height?: number;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
  notes?: string;
}

export interface OrderItemInput {
  product_id?: string;
  description?: string;
  area_sqm?: number;
  width?: number;
  height?: number;
  quantity?: number;
  unit_price?: number;
  notes?: string;
}

export interface OrderInput {
  partner_id?: string;
  project_name?: string;
  status?: string;
  order_date?: string;
  delivery_date?: string;
  delivery_method?: string;
  notes?: string;
  items: OrderItemInput[];
}

export interface OrderDetail extends Order {
  items: OrderItem[];
}

export async function createOrder(_token: string, _org: string, data: OrderInput) {
  // Use trailing slash to avoid redirect that may drop auth headers on POST
  const res = await api.post<OrderDetail>(`/orders/`, data);
  return res.data;
}

export async function listOrders(_token: string, _org: string, params?: { search?: string }) {
  const res = await api.get<Order[]>(`/orders/`, { params });
  return res.data;
}

export async function getOrder(_token: string, _org: string, id: string) {
  const res = await api.get<OrderDetail>(`/orders/${id}`);
  return res.data;
}

export async function updateOrderStatus(_token: string, _org: string, id: string, status: string) {
  const res = await api.post<Order>(`/orders/${id}/status`, { status });
  return res.data;
}

export async function updateOrderPricing(id: string, payload: { discount_percent?: number; vat_inclusive?: boolean }) {
  const res = await api.post<Order>(`/orders/${id}/pricing`, payload);
  return res.data;
}
