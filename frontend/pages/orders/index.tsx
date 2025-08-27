import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { listOrders, Order } from '../../lib/api/orders';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const token = '';
  const org = '';

  useEffect(() => {
    const load = async () => {
      const data = await listOrders(token, org);
      setOrders(data);
    };
    load();
  }, []);

  return (
    <Layout>
      <div className="flex mb-4">
        <h1 className="text-xl font-bold flex-1">Siparişler</h1>
        <Link href="/orders/new" className="bg-blue-500 text-white px-4 py-2">
          Yeni Sipariş
        </Link>
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="border p-2">No</th>
            <th className="border p-2">Durum</th>
            <th className="border p-2">Toplam</th>
            <th className="border p-2">Detay</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="border p-2">{o.order_number}</td>
              <td className="border p-2">{o.status}</td>
              <td className="border p-2">{o.grand_total}</td>
              <td className="border p-2">
                <Link href={`/orders/${o.id}`} className="text-blue-500">
                  Görüntüle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
