import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

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

export async function createOrder(token: string, org: string, data: OrderInput) {
  const res = await api.post<OrderDetail>(`/orders`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function listOrders(token: string, org: string) {
  const res = await api.get<Order[]>(`/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function getOrder(token: string, org: string, id: string) {
  const res = await api.get<OrderDetail>(`/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}

export async function updateOrderStatus(token: string, org: string, id: string, status: string) {
  const res = await api.post<Order>(`/orders/${id}/status`, { status }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Org-Slug': org,
    },
  });
  return res.data;
}
