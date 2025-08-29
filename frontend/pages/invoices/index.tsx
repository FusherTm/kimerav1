import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { listInvoices, createInvoice, getInvoiceSummary, Invoice } from '../../lib/api/invoices';
import { listPartners, Partner } from '../../lib/api/partners';
import toast from 'react-hot-toast';

export default function InvoicesPage() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [sum, setSum] = useState<{ total: number; by_month: { month: string; total: number }[] }>({ total: 0, by_month: [] });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>({ invoice_number: '', partner_id: '', issue_date: '', due_date: '', amount: '' });

  const load = async () => {
    const params: any = {};
    if (start) params.start_date = start;
    if (end) params.end_date = end;
    const [data, s, ps] = await Promise.all([
      listInvoices(params),
      getInvoiceSummary(params),
      listPartners(),
    ]);
    setRows(data);
    setSum(s);
    setPartners(ps);
  };

  useEffect(() => { load(); }, [start, end]);

  const submit = async () => {
    try {
      await createInvoice({
        invoice_number: form.invoice_number,
        partner_id: form.partner_id || undefined,
        issue_date: form.issue_date,
        due_date: form.due_date || undefined,
        amount: Number(form.amount || 0),
        status: form.status || undefined,
        notes: form.notes || undefined,
      });
      toast.success('Fatura kaydedildi');
      setModalOpen(false);
      setForm({ invoice_number: '', partner_id: '', issue_date: '', due_date: '', amount: '' });
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Kayıt başarısız');
    }
  };

  return (
    <Layout>
      <div className="flex items-end justify-between mb-4">
        <div className="flex space-x-2">
          <div>
            <label className="block text-sm">Başlangıç</label>
            <input type="date" className="border p-2" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm">Bitiş</label>
            <input type="date" className="border p-2" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2" onClick={() => setModalOpen(true)}>Yeni Fatura</button>
      </div>

      <div className="bg-white p-3 rounded shadow mb-4">
        <div className="font-semibold">Toplam: {sum.total?.toFixed(2)}</div>
        <div className="text-sm text-gray-600 mt-2">Aylık Dağılım:</div>
        <div className="text-sm">
          {sum.by_month?.length ? sum.by_month.map((m) => (
            <div key={m.month} className="flex justify-between">
              <span>{m.month}</span>
              <span>{m.total.toFixed(2)}</span>
            </div>
          )) : <div>Veri yok</div>}
        </div>
      </div>

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="border p-2 text-left">Fatura No</th>
            <th className="border p-2 text-left">Cari</th>
            <th className="border p-2 text-left">Tarih</th>
            <th className="border p-2 text-left">Vade</th>
            <th className="border p-2 text-right">Tutar</th>
            <th className="border p-2 text-left">Durum</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((r) => (
            <tr key={r.id}>
              <td className="border p-2">{r.invoice_number}</td>
              <td className="border p-2">{partners.find(p => p.id === r.partner_id)?.name || '-'}</td>
              <td className="border p-2">{r.issue_date}</td>
              <td className="border p-2">{r.due_date || '-'}</td>
              <td className="border p-2 text-right">{r.amount}</td>
              <td className="border p-2">{r.status || '-'}</td>
            </tr>
          )) : (
            <tr><td colSpan={6} className="p-4 text-center">Kayıt yok</td></tr>
          )}
        </tbody>
      </table>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-[600px] space-y-3">
            <h2 className="text-lg font-semibold">Yeni Fatura</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm">Fatura No</label>
                <input className="border p-2 w-full" value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">Cari</label>
                <select className="border p-2 w-full" value={form.partner_id} onChange={(e) => setForm({ ...form, partner_id: e.target.value })}>
                  <option value="">Seçiniz</option>
                  {partners.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm">Tarih</label>
                <input type="date" className="border p-2 w-full" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">Vade</label>
                <input type="date" className="border p-2 w-full" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">Tutar</label>
                <input type="number" step="0.01" className="border p-2 w-full" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">Durum</label>
                <input className="border p-2 w-full" value={form.status || ''} onChange={(e) => setForm({ ...form, status: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm">Not</label>
                <input className="border p-2 w-full" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-300" onClick={() => setModalOpen(false)}>Vazgeç</button>
              <button className="px-4 py-2 bg-blue-600 text-white" onClick={submit}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

