import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { getOrder, updateOrderStatus, updateOrderPricing, OrderDetail } from '../../lib/api/orders';
import { getLinkedPurchaseOrders, PurchaseOrder } from '../../lib/api/purchase';
import { listPartners, Partner } from '../../lib/api/partners';
import { listProducts, Product } from '../../lib/api/products';
import { listOpenConnections, getOrderConnection, applyConnection, Connection } from '../../lib/api/connections';

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
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConn, setSelectedConn] = useState<string>('');
  const [applyAmount, setApplyAmount] = useState<string>('');
  const [appliedInfo, setAppliedInfo] = useState<{connection_id: string; amount: number} | null>(null);
  const token = '';
  const org = '';

  useEffect(() => {
    if (!id) return;
    getOrder(token, org, id as string).then((data) => {
      setOrder(data);
      setStatus(data.status || '');
      setDiscount((data as any).discount_percent != null ? String((data as any).discount_percent) : '');
      setVatInclusive(!!(data as any).vat_inclusive);
      if (data.partner_id) {
        listOpenConnections(String(data.partner_id)).then(setConnections).catch(() => setConnections([]));
      }
    });
    listPartners().then(setPartners);
    listProducts(token, org, {}).then(setProducts);
    getLinkedPurchaseOrders(id as string).then(setLinkedPOs).catch(() => setLinkedPOs([]));
    getOrderConnection(id as string)
      .then((app) => {
        if (app) {
          setAppliedInfo({ connection_id: (app as any).connection_id, amount: (app as any).amount });
          setSelectedConn((app as any).connection_id);
          setApplyAmount(String((app as any).amount));
        }
      })
      .catch(() => setAppliedInfo(null));
  }, [id]);

  const handleStatus = async () => {
    if (!id) return;
    try {
      const updated = await updateOrderStatus(token, org, id as string, status);
      setOrder(order ? { ...order, status: updated.status } : (updated as any));
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || 'Durum güncellenemedi';
      alert(msg);
      // eslint-disable-next-line no-console
      console.error('Status update failed', e);
    }
  };

  const handlePricing = async () => {
    if (!id) return;
    const payload: any = {};
    if (discount !== '') payload.discount_percent = Number(discount);
    payload.vat_inclusive = vatInclusive;
    const updated = await updateOrderPricing(id as string, payload);
    // Preserve existing items to avoid losing detail shape
    setOrder((prev) => (prev ? ({ ...prev, ...updated }) as any : (updated as any)));
  };

  const handleApplyConnection = async () => {
    if (!id || !selectedConn) return;
    const amt = Number(applyAmount || 0);
    if (!amt || amt <= 0) { alert('Tutar giriniz'); return; }
    try {
      const app = await applyConnection(selectedConn, id as string, amt);
      setAppliedInfo({ connection_id: app.connection_id, amount: app.amount });
      if (order?.partner_id) {
        listOpenConnections(String(order.partner_id)).then(setConnections).catch(() => {});
      }
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Bağlantı uygulanamadı');
    }
  };

  return (
    <Layout>
      {order ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Siparis {order.order_number}</h1>
            <a className="text-blue-600 underline text-sm" href={`/orders/${id}/quote-print`} target="_blank" rel="noreferrer">Teklifi Yazdir</a>
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
            <h2 className="font-semibold mb-2">Fiyat Ayarlari</h2>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <span>Alt iskonto (%)</span>
                <input className="border p-1 w-24" value={discount} onChange={e=> setDiscount(e.target.value)} placeholder="orn. 5" />
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={vatInclusive} onChange={e=> setVatInclusive(e.target.checked)} />
                <span>Fiyatlar KDV Dahil</span>
              </label>
              <button className="bg-blue-500 text-white px-3 py-1" onClick={handlePricing}>Kaydet</button>
            </div>
          </div>

          {order?.status !== 'SIPARIS' && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded">
              Bağlantı uygulamak için sipariş durumunu 'SIPARIS' yapın. Yukarıdaki durum seçicisinden güncelleyebilirsiniz.
            </div>
          )}

          {order?.status === 'SIPARIS' && (
            <div className="bg-white p-3 rounded shadow">
              <h2 className="font-semibold mb-2">Bağlantı Uygula</h2>
              <div className="flex items-center gap-3">
                <select className="border p-1" value={selectedConn} onChange={(e)=> setSelectedConn(e.target.value)}>
                  <option value="">Seçiniz</option>
                  {connections.map(c => (
                    <option key={c.id} value={c.id}>
                      {(c.date ? new Date(c.date).toLocaleDateString('tr-TR') : '-') + ` - Kalan: ${c.remaining_amount}`}
                    </option>
                  ))}
                </select>
                <input className="border p-1 w-28" placeholder="Tutar" value={applyAmount} onChange={(e)=> setApplyAmount(e.target.value)} />
                <button className="bg-blue-500 text-white px-3 py-1" onClick={handleApplyConnection}>Uygula</button>
              </div>
              {appliedInfo && (
                <div className="text-sm text-gray-700 mt-2">Uygulanan bağlantı: {appliedInfo.amount}</div>
              )}
            </div>
          )}

          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="border p-2">Urun</th>
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
                  <td colSpan={6} className="text-center p-4">Bu siparis icin satir yok.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-3 ml-auto max-w-sm text-sm bg-white p-3 rounded shadow">
            <div className="flex justify-between"><span>Sipariş Toplamı</span><span>{order?.grand_total}</span></div>
            {appliedInfo && (
              <div className="flex justify-between"><span>Uygulanan Bağlantı</span><span>-{appliedInfo.amount}</span></div>
            )}
            <div className="flex justify-between font-semibold">
              <span>Kalan Borç</span>
              <span>{(Number(order?.grand_total || 0) - Number(appliedInfo?.amount || 0)).toFixed(2)}</span>
            </div>
          </div>

          {linkedPOs.length > 0 && (
            <div className="bg-white p-3 rounded shadow">
              <h2 className="font-semibold mb-2">Bagli Satinalma Siparisleri</h2>
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
        <div>Yukleniyor...</div>
      )}
    </Layout>
  );
}
