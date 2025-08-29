import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { listAssets, createAsset, deleteAsset, updateCheckStatus, Asset } from '../../lib/api/assets';
import { listPartners, Partner } from '../../lib/api/partners';
import toast from 'react-hot-toast';

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState<'VEHICLE' | 'REAL_ESTATE' | 'CHECK'>('VEHICLE');
  const [base, setBase] = useState<{ name: string; acquisition_date: string; current_value: string }>({ name: '', acquisition_date: '', current_value: '' });
  const [details, setDetails] = useState<any>({});
  const [partners, setPartners] = useState<Partner[]>([]);
  const [statusModal, setStatusModal] = useState<{ id: string; status: string } | null>(null);
  const [statusExtra, setStatusExtra] = useState<{ given_to_partner_id?: string; given_to_name?: string }>({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await listAssets();
      setAssets(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (type === 'CHECK' || statusModal) {
      listPartners().then(setPartners).catch(() => {});
    }
  }, [type, statusModal]);

  const resetForm = () => {
    setType('VEHICLE');
    setBase({ name: '', acquisition_date: '', current_value: '' });
    setDetails({});
  };

  const submit = async () => {
    try {
      const payload = {
        name: base.name,
        asset_type: type,
        acquisition_date: base.acquisition_date || undefined,
        current_value: base.current_value ? Number(base.current_value) : undefined,
        status: undefined,
        details,
      } as any;
      await createAsset(payload);
      toast.success('Varlık eklendi');
      setModalOpen(false); resetForm();
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Kayıt başarısız');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    await deleteAsset(id);
    await load();
  };

  return (
    <Layout>
      <div className="flex mb-4">
        <h1 className="text-xl font-bold flex-1">Varlıklar</h1>
        <button className="bg-blue-600 text-white px-4 py-2" onClick={() => setModalOpen(true)}>Yeni Varlık</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="border p-2 text-left">Ad</th>
              <th className="border p-2 text-left">Tip</th>
              <th className="border p-2 text-right">Değer</th>
              <th className="border p-2 text-left">Durum</th>
              <th className="border p-2">İşlem</th>
              <th className="border p-2">Banka</th>
              <th className="border p-2">Şube</th>
              <th className="border p-2">Verilen</th>
            </tr>
          </thead>
          <tbody>
            {assets.length ? assets.map(a => (
              <tr key={a.id}>
                <td className="border p-2">{a.name}</td>
                <td className="border p-2">{a.asset_type}</td>
                <td className="border p-2 text-right">{a.current_value}</td>
                <td className="border p-2">{a.status || '-'}</td>
                <td className="border p-2 text-center space-x-2">
                  {a.asset_type === 'CHECK' && (
                    <button className="px-2 py-1 bg-emerald-600 text-white" onClick={() => { setStatusModal({ id: a.id, status: '' }); setStatusExtra({}); }}>Durumu Güncelle</button>
                  )}
                  <button className="px-2 py-1 bg-red-600 text-white" onClick={() => remove(a.id)}>Sil</button>
                </td>
                <td className="border p-2">{(a as any).check_detail?.bank_name || '-'}</td>
                <td className="border p-2">{(a as any).check_detail?.bank_branch || '-'}</td>
                <td className="border p-2">{(a as any).check_detail?.given_to_name || '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="p-4 text-center">Kayıt yok</td></tr>
            )}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-[700px] space-y-3">
            <h2 className="text-lg font-semibold">Yeni Varlık</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm">Ad</label>
                <input className="border p-2 w-full" value={base.name} onChange={e => setBase({ ...base, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">Tip</label>
                <select className="border p-2 w-full" value={type} onChange={e => { setType(e.target.value as any); setDetails({}); }}>
                  <option value="VEHICLE">Araç</option>
                  <option value="REAL_ESTATE">Gayrimenkul</option>
                  <option value="CHECK">Çek</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">İktisap Tarihi</label>
                <input type="date" className="border p-2 w-full" value={base.acquisition_date} onChange={e => setBase({ ...base, acquisition_date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">Güncel Değer</label>
                <input type="number" step="0.01" className="border p-2 w-full" value={base.current_value} onChange={e => setBase({ ...base, current_value: e.target.value })} />
              </div>
            </div>

            {/* Dinamik detaylar */}
            {type === 'VEHICLE' && (
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm">Plaka</label><input className="border p-2 w-full" value={details.license_plate || ''} onChange={e => setDetails({ ...details, license_plate: e.target.value })} /></div>
                <div><label className="block text-sm">Marka</label><input className="border p-2 w-full" value={details.make || ''} onChange={e => setDetails({ ...details, make: e.target.value })} /></div>
                <div><label className="block text-sm">Model</label><input className="border p-2 w-full" value={details.model || ''} onChange={e => setDetails({ ...details, model: e.target.value })} /></div>
                <div><label className="block text-sm">Yıl</label><input className="border p-2 w-full" value={details.year || ''} onChange={e => setDetails({ ...details, year: e.target.value })} /></div>
              </div>
            )}
            {type === 'REAL_ESTATE' && (
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm">Tür</label><input className="border p-2 w-full" value={details.property_type || ''} onChange={e => setDetails({ ...details, property_type: e.target.value })} /></div>
                <div className="col-span-2"><label className="block text-sm">Adres</label><input className="border p-2 w-full" value={details.address || ''} onChange={e => setDetails({ ...details, address: e.target.value })} /></div>
                <div className="col-span-2"><label className="block text-sm">Parsel Bilgisi</label><input className="border p-2 w-full" value={details.parcel_info || ''} onChange={e => setDetails({ ...details, parcel_info: e.target.value })} /></div>
              </div>
            )}
            {type === 'CHECK' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm">Cari</label>
                  <select className="border p-2 w-full" value={details.partner_id || ''} onChange={e => setDetails({ ...details, partner_id: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {partners.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </div>
                <div><label className="block text-sm">Çek No</label><input className="border p-2 w-full" value={details.check_number || ''} onChange={e => setDetails({ ...details, check_number: e.target.value })} /></div>
                <div><label className="block text-sm">Vade</label><input type="date" className="border p-2 w-full" value={details.due_date || ''} onChange={e => setDetails({ ...details, due_date: e.target.value })} /></div>
                <div><label className="block text-sm">Tutar</label><input type="number" step="0.01" className="border p-2 w-full" value={details.amount || ''} onChange={e => setDetails({ ...details, amount: e.target.value })} /></div>
                <div><label className="block text-sm">Durum</label><input className="border p-2 w-full" value={details.status || ''} onChange={e => setDetails({ ...details, status: e.target.value })} /></div>
                <div><label className="block text-sm">Banka</label><input className="border p-2 w-full" value={details.bank_name || ''} onChange={e => setDetails({ ...details, bank_name: e.target.value })} /></div>
                <div><label className="block text-sm">Şube</label><input className="border p-2 w-full" value={details.bank_branch || ''} onChange={e => setDetails({ ...details, bank_branch: e.target.value })} /></div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-300" onClick={() => { setModalOpen(false); resetForm(); }}>Vazgeç</button>
              <button className="px-4 py-2 bg-blue-600 text-white" onClick={submit}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {statusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-[460px] space-y-3">
            <h2 className="text-lg font-semibold">Çek Durumu</h2>
            <select className="border p-2 w-full" value={statusModal.status} onChange={e => setStatusModal({ ...statusModal, status: e.target.value })}>
              <option value="">Seçiniz</option>
              <option value="PORTFOLIO">Portföy</option>
              <option value="DEPOSITED">Tahsilde</option>
              <option value="CASHED">Tahsil Edildi</option>
              <option value="USED">Kullanıldı</option>
            </select>
            {statusModal.status === 'USED' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm">Kime Verildi (Cari)</label>
                  <select className="border p-2 w-full" value={statusExtra.given_to_partner_id || ''} onChange={e => setStatusExtra({ ...statusExtra, given_to_partner_id: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {partners.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm">Kime Verildi (Serbest Metin)</label>
                  <input className="border p-2 w-full" value={statusExtra.given_to_name || ''} onChange={e => setStatusExtra({ ...statusExtra, given_to_name: e.target.value })} />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-300" onClick={() => setStatusModal(null)}>Vazgeç</button>
              <button className="px-4 py-2 bg-blue-600 text-white" onClick={async () => {
                if (!statusModal.status) return;
                await updateCheckStatus(statusModal.id, statusModal.status, statusExtra.given_to_partner_id, statusExtra.given_to_name);
                setStatusModal(null);
                setStatusExtra({});
                await load();
              }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

