import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { listOrders, Order } from '../../lib/api/orders';
import { listPartners, Partner } from '../../lib/api/partners';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const token = '';
  const org = '';
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const data = await listOrders(token, org, search ? { search } : undefined);
      const p = await listPartners();
      setOrders(data);
      setPartners(p);
    };
    load();
  }, [search]);

  return (
    <Layout>
      <div className="flex mb-4 space-x-2">
        <h1 className="text-xl font-bold flex-1">Siparişler</h1>
        <Link href="/orders/temper" className="bg-emerald-600 text-white px-4 py-2">Temper Siparişi</Link>
        <Link href="/orders/new" className="bg-blue-500 text-white px-4 py-2">Yeni Sipariş</Link>
      </div>
      <div className="mb-3 flex">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari adı, sipariş no veya proje adı ile ara"
          className="border p-2 flex-1"
        />
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="border p-2">Sipariş No</th>
            <th className="border p-2">Sipariş Adı</th>
            <th className="border p-2">Cari</th>
            <th className="border p-2">Durum</th>
            <th className="border p-2">Tutar</th>
            <th className="border p-2">Detay</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((o) => (
              <tr key={o.id}>
                <td className="border p-2">{o.order_number}</td>
                <td className="border p-2">{(o as any).project_name || '-'}</td>
                <td className="border p-2">{partners.find((p) => p.id === o.partner_id)?.name || ''}</td>
                <td className="border p-2">{o.status}</td>
                <td className="border p-2">{o.grand_total}</td>
                <td className="border p-2">
                  <Link href={`/orders/${o.id}`} className="text-blue-500">Görüntüle</Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center p-4">Kayıt yok. Yeni sipariş oluşturun.</td>
            </tr>
          )}
        </tbody>
      </table>
    </Layout>
  );
}

