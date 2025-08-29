import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { getPartner, getPartnerOrders, getPartnerStatement, Partner, Order, PartnerStatement } from '../../lib/api/partners';

export default function PartnerDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [partner, setPartner] = useState<Partner | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statement, setStatement] = useState<PartnerStatement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [p, o, s] = await Promise.all([
          getPartner(id as string),
          getPartnerOrders(id as string),
          getPartnerStatement(id as string),
        ]);
        setPartner(p);
        setOrders(o);
        setStatement(s);
      } catch (e: any) {
        setError(e?.response?.data?.detail || e?.message || 'Kaynaklar yüklenemedi');
      }
    })();
  }, [id]);

  return (
    <Layout>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {partner ? (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded shadow">
            <h1 className="text-xl font-bold">{partner.name}</h1>
            <div className="text-sm text-gray-600">{partner.type}</div>
            {statement && (
              <div className="mt-2">
                {(() => {
                  const bal = statement.summary.balance || 0;
                  const isSupplier = partner.type === 'SUPPLIER';
                  let label = '';
                  let color = '';
                  if (isSupplier) {
                    label = bal > 0 ? 'Borç' : bal < 0 ? 'Alacak' : 'Bakiye';
                    color = bal > 0 ? 'text-red-600' : bal < 0 ? 'text-green-600' : 'text-gray-700';
                  } else {
                    label = bal > 0 ? 'Alacak' : bal < 0 ? 'Borç' : 'Bakiye';
                    color = bal > 0 ? 'text-green-600' : bal < 0 ? 'text-red-600' : 'text-gray-700';
                  }
                  return (
                    <div className={`inline-flex items-center px-3 py-1 rounded border ${color} border-current text-sm font-semibold`}>
                      <span className="mr-2">{label}:</span>
                      <span>{Math.abs(bal).toFixed(2)}</span>
                    </div>
                  );
                })()}
              </div>
            )}
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>Email: {partner.email || '-'}</div>
              <div>Telefon: {partner.phone || '-'}</div>
              <div>Adres: {partner.address || '-'}</div>
              <div>Vergi No: {partner.tax_number || '-'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold mb-2">Son Siparişler</h2>
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="border p-2 text-left">No</th>
                    <th className="border p-2 text-left">Sipariş Adı</th>
                    <th className="border p-2 text-left">Durum</th>
                    <th className="border p-2 text-right">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map(o => (
                      <tr key={o.id}>
                        <td className="border p-2">{o.order_number}</td>
                        <td className="border p-2">{(o as any).project_name || '-'}</td>
                        <td className="border p-2">{o.status}</td>
                        <td className="border p-2 text-right">{o.grand_total}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td className="p-3 text-center" colSpan={4}>Kayıt yok</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Hesap Ekstresi</h2>
                {id && (
                  <a
                    className="text-blue-600 underline text-sm"
                    href={`/partners/${id}/statement-print`}
                    target="_blank" rel="noreferrer"
                  >Yazdır</a>
                )}
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <div>Giriş: <span className="font-semibold">{statement?.summary.incoming ?? 0}</span></div>
                <div>Çıkış: <span className="font-semibold">{statement?.summary.outgoing ?? 0}</span></div>
                <div>Bakiye: <span className="font-semibold">{statement?.summary.balance ?? 0}</span></div>
              </div>
              <div className="max-h-64 overflow-auto border rounded">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">Sipariş</th>
                      <th className="border p-2 text-left">m²</th>
                      <th className="border p-2 text-right">Tutar</th>
                      <th className="border p-2 text-left">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statement && statement.items.length > 0 ? (
                      statement.items.map(i => (
                        <tr key={i.id}>
                          <td className="border p-2">{(i as any).document_name || i.description || '-'}</td>
                          <td className="border p-2">{(i as any).area_sqm != null ? Number((i as any).area_sqm).toFixed(2) : '-'}</td>
                          <td className="border p-2 text-right">{i.amount}</td>
                          <td className="border p-2">{i.description || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td className="p-3 text-center" colSpan={4}>Kayıt yok</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>Yükleniyor...</div>
      )}
    </Layout>
  );
}

