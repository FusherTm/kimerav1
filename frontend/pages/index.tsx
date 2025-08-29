import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getDashboardSummary, DashboardSummary } from '../lib/api/dashboard';

export default function Home() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
        const org = typeof window !== 'undefined' ? localStorage.getItem('org_slug') || '' : '';
        if (!token) {
          router.replace('/login');
          return;
        }
        const data = await getDashboardSummary(token, org || 'default-org');
        setSummary(data);
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Gösterge Paneli</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bakiye Durumu */}
            <section className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">Bakiye Durumu</h2>
              <div className="text-sm text-gray-500">Toplam Bakiye</div>
              <div className="text-3xl font-extrabold mb-2">{(summary?.total_balance ?? 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-500">Toplam Alacak</div>
                  <div className="font-semibold">{(summary?.total_receivables ?? 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-500">Toplam Borç</div>
                  <div className="font-semibold">{(summary?.total_payables ?? 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
                </div>
              </div>
              {/* Sparkline */}
              {summary?.cash_flow_7d && summary.cash_flow_7d.length > 0 && (
                <div className="mt-3">
                  <Sparkline data={summary.cash_flow_7d} />
                </div>
              )}
            </section>

            {/* Son Hareketler */}
            <section className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">Son Hareketler</h2>
              <ul className="divide-y">
                {summary?.recent_transactions?.length ? (
                  summary?.recent_transactions.map((t) => (
                    <li key={t.id} className="py-2 flex justify-between text-sm">
                      <div className="truncate mr-2">
                        <div className="font-medium truncate">{t.description || '(Açıklama yok)'}</div>
                        <div className="text-gray-500">{t.transaction_date || ''}</div>
                      </div>
                      <div className={"font-semibold " + (t.direction === 'IN' ? 'text-green-600' : 'text-red-600')}>
                        {t.direction === 'IN' ? '+' : '-'} {(t.amount ?? 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500">Kayıt yok</li>
                )}
              </ul>
            </section>

            {/* Üretimdeki İşler */}
            <section className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">Üretimdeki İşler</h2>
              <div className="text-3xl font-extrabold mb-3">{summary?.active_jobs ?? 0}</div>
              <div className="space-y-1">
                {summary && Object.keys(summary.jobs_by_station || {}).length ? (
                  Object.entries(summary.jobs_by_station || {}).map(([k, v]) => {
                    const label = k === 'UNASSIGNED' ? 'Atanmamış' : k;
                    return (
                    <div key={k} className="flex items-center text-sm">
                      <div className="w-32 text-gray-600 truncate" title={label}>{label}</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded mx-2">
                        <div className="h-2 bg-blue-500 rounded" style={{ width: `${Math.min(100, (v as number) / (summary.active_jobs || 1) * 100)}%` }} />
                      </div>
                      <div className="w-8 text-right font-semibold">{v as number}</div>
                    </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500">Kayıt yok</div>
                )}
              </div>
            </section>

            {/* Günün Teslimatları */}
            <section className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">Günün Teslimatları</h2>
              <ul className="divide-y">
                {summary?.todays_deliveries?.length ? (
                  summary.todays_deliveries.map((o) => (
                    <li key={o.id} className="py-2 text-sm flex justify-between">
                      <div className="truncate mr-2">{o.partner_name || '-'}</div>
                      <div className="font-semibold">{o.order_number || '-'}</div>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500">Bugün teslimat yok</li>
                )}
              </ul>
            </section>
          </div>
        </div>
      )}
    </Layout>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const w = 280; const h = 40; const pad = 2;
  const max = Math.max(...data.map(v => Math.abs(v)), 1);
  const step = (w - pad * 2) / Math.max(1, data.length - 1);
  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = h / 2 - (v / max) * (h / 2 - pad);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="text-blue-500">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  );
}

