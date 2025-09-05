import { useEffect, useState } from 'react';
import { listPartners, Partner } from '../lib/api/partners';
import { createConnection } from '../lib/api/connections';

export default function ConnectionForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerId, setPartnerId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [method, setMethod] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { listPartners({}).then(setPartners).catch(() => setPartners([])); }, []);

  const submit = async () => {
    try {
      if (!partnerId) return setError('Cari seçiniz');
      const amt = Number(amount);
      if (!amt || amt <= 0) return setError('Geçerli tutar giriniz');
      await createConnection({ partner_id: partnerId, total_amount: amt, date: date || undefined, method: method || undefined, description: description || undefined });
      onSuccess();
    } catch (e: any) {
      const d = e?.response?.data?.detail;
      if (Array.isArray(d)) {
        setError(d.map((x: any) => x?.msg || '').filter(Boolean).join(', ') || 'Kayıt başarısız');
      } else if (d && typeof d === 'object') {
        setError(d?.msg || JSON.stringify(d));
      } else if (typeof d === 'string') {
        setError(d);
      } else {
        setError(e?.message || 'Kayıt başarısız');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow w-[420px]">
        <h2 className="text-lg font-semibold mb-3">Yeni Bağlantı</h2>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="space-y-2">
          <div>
            <label className="block text-sm mb-1">Cari</label>
            <select value={partnerId} onChange={e=> setPartnerId(e.target.value)} className="border p-2 w-full">
              <option value="">Seçiniz</option>
              {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Tutar</label>
            <input type="number" value={amount} onChange={e=> setAmount(e.target.value)} className="border p-2 w-full" placeholder="ör. 1000000"/>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm mb-1">Tarih</label>
              <input type="date" value={date} onChange={e=> setDate(e.target.value)} className="border p-2 w-full"/>
            </div>
            <div>
              <label className="block text-sm mb-1">Yöntem</label>
              <input value={method} onChange={e=> setMethod(e.target.value)} className="border p-2 w-full" placeholder="çek/nakit/havale"/>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Açıklama</label>
            <textarea value={description} onChange={e=> setDescription(e.target.value)} className="border p-2 w-full" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 border">Vazgeç</button>
          <button onClick={submit} className="px-3 py-1 bg-blue-600 text-white">Kaydet</button>
        </div>
      </div>
    </div>
  );
}
