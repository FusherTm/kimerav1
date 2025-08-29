import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import PartnerForm, { PartnerFormValues } from '../../components/PartnerForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';
import { listPartners, createPartner, updatePartner, deletePartner, Partner } from '../../lib/api/partners';

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);
  const [error, setError] = useState('');

  const loadPartners = async () => {
    const params: any = {};
    if (typeFilter !== 'All') params.type = typeFilter;
    if (search) params.search = search;
    try {
      const rows = await listPartners(params);
      setPartners(rows);
      setError('');
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.detail ?? err?.message ?? 'Bilinmeyen hata';
      setError(`Listeleme başarısız: ${status ?? ''} ${msg}`);
    }
  };

  useEffect(() => { loadPartners(); }, [search, typeFilter]);

  const handleCreate = () => { setEditingPartner(null); setModalOpen(true); };

  const handleSubmit = async (values: PartnerFormValues) => {
    try {
      if (editingPartner) {
        await updatePartner(editingPartner.id, values);
        toast.success('Cari güncellendi');
      } else {
        await createPartner(values);
        toast.success('Cari oluşturuldu');
      }
      setModalOpen(false);
      await loadPartners();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err.message || 'İşlem başarısız');
    }
  };

  const handleEdit = (partner: Partner) => { setEditingPartner(partner); setModalOpen(true); };
  const handleDelete = (partner: Partner) => { setDeletingPartner(partner); };

  const confirmDelete = async () => {
    if (!deletingPartner) return;
    try {
      await deletePartner(deletingPartner.id);
      toast.success('Cari silindi');
      await loadPartners();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err.message || 'Silme başarısız');
    }
    setDeletingPartner(null);
  };

  const typeLabel = (t?: string) => (t === 'CUSTOMER' ? 'Müşteri' : t === 'SUPPLIER' ? 'Tedarikçi' : 'Her İkisi');

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Müşteriler ve Tedarikçiler</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div className="mb-4 flex space-x-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ara" className="border p-2" />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border p-2">
          <option value="All">Hepsi</option>
          <option value="CUSTOMER">Müşteri</option>
          <option value="SUPPLIER">Tedarikçi</option>
        </select>
        <button onClick={handleCreate} className="ml-auto bg-blue-500 text-white px-4 py-2">Yeni Partner Ekle</button>
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="border p-2 text-left">Ad</th>
            <th className="border p-2 text-left">Tür</th>
            <th className="border p-2 text-left">E-posta</th>
            <th className="border p-2 text-left">Telefon</th>
            <th className="border p-2">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {partners.length > 0 ? (
            partners
              .slice()
              .sort((a, b) => {
                const an = a.name === 'Muhtelif Müşteri' ? 0 : 1;
                const bn = b.name === 'Muhtelif Müşteri' ? 0 : 1;
                if (an !== bn) return an - bn;
                return a.name.localeCompare(b.name);
              })
              .map((p) => (
              <tr key={p.id} className="cursor-pointer hover:bg-gray-50" onClick={() => (window.location.href = `/partners/${p.id}`)}>
                <td className="border p-2">
                  {p.name}
                  {p.name === 'Muhtelif Müşteri' && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-800 align-middle">Muhtelif</span>
                  )}
                </td>
                <td className="border p-2">{typeLabel(p.type as any)}</td>
                <td className="border p-2">{p.email}</td>
                <td className="border p-2">{p.phone}</td>
                <td className="border p-2 space-x-2 text-center">
                  <button onClick={() => handleEdit(p)} className="px-2 py-1 bg-yellow-400">Düzenle</button>
                  <button onClick={() => handleDelete(p)} className="px-2 py-1 bg-red-500 text-white">Sil</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center p-4">Kayıt yok. "Yeni Partner Ekle" ile ekleyin.</td>
            </tr>
          )}
        </tbody>
      </table>
      {modalOpen && (
        <PartnerForm initialValues={editingPartner || undefined} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      )}
      {deletingPartner && (
        <ConfirmDialog
          message="Silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
          onConfirm={confirmDelete}
          onCancel={() => setDeletingPartner(null)}
        />
      )}
    </Layout>
  );
}

