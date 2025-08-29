import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { postPurchaseOrder } from '../../lib/api/purchase';
import api from '../../lib/api/client';

interface PO {
  id: string;
  partner_id?: string;
  po_number?: string;
  status?: string;
  order_date?: string;
  expected_delivery_date?: string;
  grand_total?: number;
}

export default function PurchaseOrdersPage() {
  const [pos, setPOs] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PO[]>(`/purchase_orders/`);
      setPOs(data);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePost = async (id: string) => {
    try {
      await postPurchaseOrder(id);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.detail || e.message);
    }
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Satınalma Siparişleri</h1>
      {error && <div className="text-red-600">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="border p-2 text-left">PO No</th>
              <th className="border p-2 text-left">Durum</th>
              <th className="border p-2 text-right">Tutar</th>
              <th className="border p-2">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {pos.length ? pos.map(po => (
              <tr key={po.id}>
                <td className="border p-2">{po.po_number || po.id}</td>
                <td className="border p-2">{po.status}</td>
                <td className="border p-2 text-right">{po.grand_total}</td>
                <td className="border p-2 text-center">
                  <button className="px-2 py-1 bg-emerald-600 text-white" onClick={() => handlePost(po.id)}>Postla</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="p-4 text-center">Kayıt yok</td></tr>
            )}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

