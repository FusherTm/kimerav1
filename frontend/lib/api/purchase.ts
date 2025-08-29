import api from './client';

export interface PurchaseOrderInput {
  partner_id?: string;
  po_number?: string;
  status?: string;
  order_date?: string;
  expected_delivery_date?: string;
  grand_total?: number;
  sales_order_id?: string;
}

export interface PurchaseOrder {
  id: string;
  partner_id?: string;
  po_number?: string;
  status?: string;
  order_date?: string;
  expected_delivery_date?: string;
  grand_total?: number;
}

export interface PurchaseOrderItemInput {
  purchase_order_id: string;
  description?: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
  sales_order_item_id?: string;
}

export async function createPurchaseOrder(_token: string, _org: string, data: PurchaseOrderInput) {
  const res = await api.post<PurchaseOrder>(`/purchase_orders/`, data);
  return res.data;
}

export async function createPurchaseOrderItem(_token: string, _org: string, data: PurchaseOrderItemInput) {
  const res = await api.post(`/purchase_order_items/`, data);
  return res.data;
}

export async function postPurchaseOrder(poId: string) {
  const res = await api.post(`/purchase_orders/${poId}/post`, {});
  return res.data;
}

export async function getLinkedPurchaseOrders(orderId: string) {
  const res = await api.get(`/orders/${orderId}/linked-purchase-orders`);
  return res.data as PurchaseOrder[];
}
