import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { createMaterial, deleteMaterial, getMaterials, Material, updateMaterial } from '../../lib/api/materials';

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow p-4 w-full max-w-md relative">
        <button className="absolute right-2 top-2 text-gray-500" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}

export default function StockPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Material | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMaterials();
      setMaterials(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Liste alınamadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Stok Yönetimi</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setCreateOpen(true)}>Yeni Malzeme Ekle</button>
      </div>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left">Ad</th>
              <th className="border p-2 text-left">SKU</th>
              <th className="border p-2 text-right">Stok</th>
              <th className="border p-2 text-left">Birim</th>
              <th className="border p-2 text-left">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan={5}>Yükleniyor...</td></tr>
            ) : materials.length > 0 ? (
              materials.map(m => (
                <tr key={m.id}>
                  <td className="border p-2">{m.name}</td>
                  <td className="border p-2">{m.sku}</td>
                  <td className="border p-2 text-right">{Number(m.stock_quantity || 0)}</td>
                  <td className="border p-2">{m.unit}</td>
                  <td className="border p-2">
                    <button className="px-3 py-1 border rounded mr-2" onClick={() => setEditTarget(m)}>Düzenle</button>
                    <button className="px-3 py-1 border rounded text-red-600" onClick={async () => { if (confirm('Silinsin mi?')) { await deleteMaterial(m.id); await load(); } }}>Sil</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td className="p-3 text-center" colSpan={5}>Kayıt yok</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {createOpen && (
        <Modal onClose={() => setCreateOpen(false)}>
          <h2 className="text-lg font-semibold mb-3">Yeni Malzeme</h2>
          <MaterialForm onCancel={() => setCreateOpen(false)} onSaved={async () => { setCreateOpen(false); await load(); }} />
        </Modal>
      )}

      {editTarget && (
        <Modal onClose={() => setEditTarget(null)}>
          <h2 className="text-lg font-semibold mb-3">Malzeme Düzenle</h2>
          <MaterialEditForm material={editTarget} onCancel={() => setEditTarget(null)} onSaved={async () => { setEditTarget(null); await load(); }} />
        </Modal>
      )}
    </Layout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      {children}
    </label>
  );
}

function MaterialForm({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState<number | ''>('');
  const [unit, setUnit] = useState('ADET');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true); setError(null);
    try {
      await createMaterial({ name, sku, stock_quantity: stock === '' ? undefined : Number(stock), unit });
      onSaved();
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Kaydedilemedi');
    } finally { setSaving(false); }
  };

  return (
    <div>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <Field label="Ad"><input className="border rounded p-2 w-full" value={name} onChange={e => setName(e.target.value)} /></Field>
      <Field label="SKU"><input className="border rounded p-2 w-full" value={sku} onChange={e => setSku(e.target.value)} /></Field>
      <Field label="Stok"><input type="number" step="0.01" className="border rounded p-2 w-full" value={stock} onChange={e => setStock(e.target.value === '' ? '' : Number(e.target.value))} /></Field>
      <Field label="Birim"><input className="border rounded p-2 w-full" value={unit} onChange={e => setUnit(e.target.value)} /></Field>
      <div className="flex justify-end gap-2 mt-2">
        <button className="px-4 py-2 border rounded" onClick={onCancel} disabled={saving}>İptal</button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={save} disabled={saving}>Kaydet</button>
      </div>
    </div>
  );
}

function MaterialEditForm({ material, onCancel, onSaved }: { material: Material; onCancel: () => void; onSaved: () => void }) {
  const [stock, setStock] = useState<number | ''>(material.stock_quantity ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true); setError(null);
    try {
      await updateMaterial(material.id, { stock_quantity: stock === '' ? 0 : Number(stock) });
      onSaved();
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Güncellenemedi');
    } finally { setSaving(false); }
  };

  return (
    <div>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <div className="mb-3 text-sm"><span className="font-semibold">Ad:</span> {material.name} &nbsp; <span className="font-semibold">SKU:</span> {material.sku}</div>
      <Field label="Stok Miktarı">
        <input type="number" step="0.01" className="border rounded p-2 w-full" value={stock} onChange={e => setStock(e.target.value === '' ? '' : Number(e.target.value))} />
      </Field>
      <div className="flex justify-end gap-2 mt-2">
        <button className="px-4 py-2 border rounded" onClick={onCancel} disabled={saving}>İptal</button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={save} disabled={saving}>Kaydet</button>
      </div>
    </div>
  );
}

