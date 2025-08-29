import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import CompanyHeader from '../../../components/CompanyHeader';
import { branding } from '../../../lib/branding';
import { getPartner, getPartnerStatement, Partner, PartnerStatement, StatementItem } from '../../../lib/api/partners';

export default function PartnerStatementPrint() {
  const router = useRouter();
  const { id, from, to } = router.query as { id?: string; from?: string; to?: string };
  const [partner, setPartner] = useState<Partner | null>(null);
  const [statement, setStatement] = useState<PartnerStatement | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [p, s] = await Promise.all([
        getPartner(id as string),
        getPartnerStatement(id as string, { start_date: from, end_date: to }),
      ]);
      setPartner(p);
      setStatement(s);
    })();
  }, [id, from, to]);

  const rows = useMemo(() => {
    const out: (StatementItem & { debit: number; credit: number; balance: number })[] = [];
    if (!statement) return out;
    let balance = 0;
    const items = [...statement.items].sort((a, b) => (a.transaction_date || '').localeCompare(b.transaction_date || ''));
    for (const i of items) {
      const amount = Number(i.amount || 0);
      const method = (i as any).method ? String((i as any).method).toUpperCase() : '';
      const isPosting = method === 'ORDER' || method === 'PURCHASE';
      let debit = 0;
      let credit = 0;
      if (isPosting) {
        debit = amount;
        balance += amount;
      } else {
        if (i.direction === 'IN') {
          credit = amount;
        } else {
          debit = amount;
        }
        balance -= amount;
      }
      out.push({ ...i, debit, credit, balance });
    }
    return out;
  }, [statement]);

  return (
    <div className="p-6 print:p-0">
      <div className="no-print mb-4 flex items-center justify-between">
        <button className="px-4 py-2 border" onClick={() => window.print()}>Yazdır</button>
        <button className="px-4 py-2 border" onClick={() => router.back()}>Geri</button>
      </div>
      <div className="max-w-4xl mx-auto">
        <CompanyHeader />
        <h2 className="text-xl font-bold text-center mb-2">Cari Ekstresi</h2>
        {partner && (
          <div className="mb-4 text-sm">
            <div><span className="font-semibold">Cari:</span> {partner.name}</div>
            <div className="flex gap-4">
              <div><span className="font-semibold">Tür:</span> {partner.type}</div>
              {from && <div><span className="font-semibold">Başlangıç:</span> {from}</div>}
              {to && <div><span className="font-semibold">Bitiş:</span> {to}</div>}
            </div>
          </div>
        )}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left">Tarih</th>
              <th className="border p-2 text-left">Belge</th>
              <th className="border p-2 text-right">m²</th>
              <th className="border p-2 text-left">Açıklama</th>
              <th className="border p-2 text-right">Borç</th>
              <th className="border p-2 text-right">Alacak</th>
              <th className="border p-2 text-right">Bakiye</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="border p-2">{r.transaction_date?.slice(0, 10) || '-'}</td>
                <td className="border p-2">{r.document_name || '-'}</td>
                <td className="border p-2 text-right">{(r as any).area_sqm != null ? Number((r as any).area_sqm).toFixed(2) : ''}</td>
                <td className="border p-2">{r.description || '-'}</td>
                <td className="border p-2 text-right">{r.debit ? r.debit.toFixed(2) : ''}</td>
                <td className="border p-2 text-right">{r.credit ? r.credit.toFixed(2) : ''}</td>
                <td className="border p-2 text-right">{r.balance.toFixed(2)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="border p-2 text-center" colSpan={7}>Kayıt yok</td></tr>
            )}
          </tbody>
        </table>
        {statement && (
          <div className="mt-4 text-right text-sm">
            <div>Toplam Borç: <span className="font-semibold">{rows.reduce((s, r) => s + r.debit, 0).toFixed(2)}</span></div>
            <div>Toplam Alacak: <span className="font-semibold">{rows.reduce((s, r) => s + r.credit, 0).toFixed(2)}</span></div>
            <div>Bakiye: <span className="font-semibold">{(rows.length ? rows[rows.length - 1].balance : 0).toFixed(2)}</span></div>
          </div>
        )}
        {branding.signatureText && (
          <div className="mt-12 text-right text-sm">
            <div className="inline-block text-center">
              <div className="border-t border-gray-400 px-8 pt-1">{branding.signatureText}</div>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}

