import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { getOrder, updateOrderStatus, updateOrderPricing, OrderDetail } from '../../lib/api/orders';
import { getLinkedPurchaseOrders, PurchaseOrder } from '../../lib/api/purchase';
import { listPartners, Partner } from '../../lib/api/partners';
import { listProducts, Product } from '../../lib/api/products';

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [status, setStatus] = useState('');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [linkedPOs, setLinkedPOs] = useState<PurchaseOrder[]>([]);
  const [discount, setDiscount] = useState<string>('');
  const [vatInclusive, setVatInclusive] = useState<boolean>(false);
  const token = '';
  const org = '';

  useEffect(() => {
    if (!id) return;
    getOrder(token, org, id as string).then((data) => {
      setOrder(data);
      setStatus(data.status || '');
      setDiscount((data as any).discount_percent != null ? String((data as any).discount_percent) : '');
      setVatInclusive(!!(data as any).vat_inclusive);
    });
    listPartners().then(setPartners);
    listProducts(token, org, {}).then(setProducts);
    getLinkedPurchaseOrders(id as string).then(setLinkedPOs).catch(() => setLinkedPOs([]));
  }, [id]);

  const handleStatus = async () => {\n    if (!id) return;\n    try {\n      const updated = await updateOrderStatus(token, org, id as string, status);\n      setOrder(order ? { ...order, status: updated.status } : (updated as any));\n    } catch (e: any) {\n      const msg = e?.response?.data?.detail || e?.message || 'Durum g�ncellenemedi';\n      alert(msg);\n      console.error('Status update failed', e);\n    }\n  };

  const handlePricing = async () => {
    if (!id) return;
    const payload: any = {};
    if (discount !== '') payload.discount_percent = Number(discount);
    payload.vat_inclusive = vatInclusive;
    const updated = await updateOrderPricing(id as string, payload);
    // Preserve existing items to avoid losing detail shape
    setOrder((prev) => (prev ? ({ ...prev, ...updated }) as any : (updated as any)));
  };

  return (
    <Layout>
      {order ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Sipariş {order.order_number}</h1>
            <a className="text-blue-600 underline text-sm" href={`/orders/${id}/quote-print`} target="_blank" rel="noreferrer">Teklifi Yazdır</a>
          </div>
          <div>Partner: {partners.find((p) => p.id === order.partner_id)?.name || ''}</div>
          <div>Durum: {order.status}</div>
          <div className="flex items-center space-x-2">
            <select className="border p-1" value={status} onChange={(e) => setStatus(e.target.value)}>
              {['DRAFT', 'SIPARIS', 'URETIMDE', 'TAMAMLANDI'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button className="bg-blue-500 text-white px-4 py-2" onClick={handleStatus}>Durumu Güncelle</button>
          </div>

          <div className="bg-white p-3 rounded shadow">
            <h2 className="font-semibold mb-2">Fiyat Ayarları</h2>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <span>Alt İskonto (%)</span>
                <input className="border p-1 w-24" value={discount} onChange={e=> setDiscount(e.target.value)} placeholder="örn. 5" />
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={vatInclusive} onChange={e=> setVatInclusive(e.target.checked)} />
                <span>Fiyatlar KDV Dahil</span>
              </label>
              <button className="bg-blue-500 text-white px-3 py-1" onClick={handlePricing}>Kaydet</button>
            </div>
          </div>

          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="border p-2">Ürün</th>
                <th className="border p-2">En</th>
                <th className="border p-2">Boy</th>
                <th className="border p-2">Adet</th>
                <th className="border p-2">Birim Fiyat</th>
                <th className="border p-2">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((it) => (
                  <tr key={it.id}>
                    <td className="border p-2">{products.find((pr) => pr.id === it.product_id)?.name || it.description}</td>
                    <td className="border p-2">{it.width}</td>
                    <td className="border p-2">{it.height}</td>
                    <td className="border p-2">{it.quantity}</td>
                    <td className="border p-2">{it.unit_price}</td>
                    <td className="border p-2">{it.total_price}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-4">No items found for this order.</td>
                </tr>
              )}
            </tbody>
          </table>

          {linkedPOs.length > 0 && (
            <div className="bg-white p-3 rounded shadow">
              <h2 className="font-semibold mb-2">Bağlı Satınalma Siparişleri</h2>
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="border p-2 text-left">PO No</th>
                    <th className="border p-2 text-right">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedPOs.map(po => (
                    <tr key={po.id}>
                      <td className="border p-2"><a href="/purchase-orders" className="text-blue-500 underline">{po.po_number || po.id}</a></td>
                      <td className="border p-2 text-right">{po.grand_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>Yükleniyor...</div>
      )}
    </Layout>
  );
}


