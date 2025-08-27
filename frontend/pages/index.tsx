import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getDashboardSummary, DashboardSummary } from '../lib/api/dashboard';

export default function Home() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const token = '';
  const org = '';

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDashboardSummary(token, org);
        setSummary(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section>
            <h2 className="text-lg font-semibold mb-2">Finansal Özet</h2>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Toplam Bakiye</div>
              <div className="text-2xl font-bold">
                {summary?.total_balance?.toFixed(2)}
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2">Operasyonel Özet</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded shadow">
                <div className="text-sm text-gray-500">Aktif İşler</div>
                <div className="text-2xl font-bold">
                  {summary?.active_jobs}
                </div>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <div className="text-sm text-gray-500">Bekleyen Siparişler</div>
                <div className="text-2xl font-bold">
                  {summary?.waiting_orders}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </Layout>
  );
}
