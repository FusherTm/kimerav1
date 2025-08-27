import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { getOrder, updateOrderStatus, OrderDetail } from '../../lib/api/orders';

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [status, setStatus] = useState('');
  const token = '';
  const org = '';

  useEffect(() => {
    if (id) {
      getOrder(token, org, id as string).then((data) => {
        setOrder(data);
        setStatus(data.status || '');
      });
    }
  }, [id]);

  const handleStatus = async () => {
    if (!id) return;
    await updateOrderStatus(token, org, id as string, status);
    setOrder(order ? { ...order, status } : order);
  };

  return (
    <Layout>
      {order ? (
        <div className="space-y-4">
          <h1 className="text-xl font-bold">Sipariş {order.order_number}</h1>
          <div>Durum: {order.status}</div>
          <div className="flex items-center space-x-2">
            <select
              className="border p-1"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {['DRAFT', 'SIPARIS', 'URETIMDE', 'TAMAMLANDI'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              className="bg-blue-500 text-white px-4 py-2"
              onClick={handleStatus}
            >
              Durumu Güncelle
            </button>
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
              {order.items.map((it) => (
                <tr key={it.id}>
                  <td className="border p-2">{it.description}</td>
                  <td className="border p-2">{it.width}</td>
                  <td className="border p-2">{it.height}</td>
                  <td className="border p-2">{it.quantity}</td>
                  <td className="border p-2">{it.unit_price}</td>
                  <td className="border p-2">{it.total_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>Yükleniyor...</div>
      )}
    </Layout>
  );
}
