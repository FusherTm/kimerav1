import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { listRoles, updateRole, createRole, deleteRole } from '../../lib/api/admin';
import toast from 'react-hot-toast';

const PERMISSIONS: Array<{ key: string; label: string }> = [
  { key: 'partner:view', label: 'Cariler: Görüntüle' },
  { key: 'partner:create', label: 'Cariler: Oluştur' },
  { key: 'partner:update', label: 'Cariler: Güncelle' },
  { key: 'partner:delete', label: 'Cariler: Sil' },
  { key: 'product:view', label: 'Ürünler: Görüntüle' },
  { key: 'product:create', label: 'Ürünler: Oluştur' },
  { key: 'product:update', label: 'Ürünler: Güncelle' },
  { key: 'product:delete', label: 'Ürünler: Sil' },
  { key: 'category:view', label: 'Kategoriler: Görüntüle' },
  { key: 'category:create', label: 'Kategoriler: Oluştur' },
  { key: 'category:update', label: 'Kategoriler: Güncelle' },
  { key: 'category:delete', label: 'Kategoriler: Sil' },
  { key: 'order:view', label: 'Siparişler: Görüntüle' },
  { key: 'order:create', label: 'Siparişler: Oluştur' },
  { key: 'order:update', label: 'Siparişler: Güncelle' },
  { key: 'order:status', label: 'Siparişler: Durum Değiştir' },
  { key: 'production:view', label: 'Üretim: Görüntüle' },
  { key: 'production:update', label: 'Üretim: Güncelle' },
  { key: 'finance:view', label: 'Finans: Görüntüle' },
  { key: 'finance:create', label: 'Finans: İşlem Oluştur' },
  { key: 'finance:post', label: 'Finans: Post (PO vb.)' },
  { key: 'asset:view', label: 'Varlıklar: Görüntüle' },
  { key: 'asset:create', label: 'Varlıklar: Oluştur' },
  { key: 'asset:update', label: 'Varlıklar: Güncelle' },
  { key: 'asset:delete', label: 'Varlıklar: Sil' },
  { key: 'asset:check-status', label: 'Çek: Durum Değiştir' },
  { key: 'invoice:view', label: 'Faturalar: Görüntüle' },
  { key: 'invoice:create', label: 'Faturalar: Oluştur' },
  { key: 'admin:view', label: 'Yönetim: Görüntüle' },
  { key: 'admin:update', label: 'Yönetim: Roller Güncelle' },
  { key: 'admin:assign', label: 'Yönetim: Rol Atama' },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Array<{ name: string; permissions: Record<string, boolean> }>>([]);
  const [selected, setSelected] = useState<string>('');
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const [newRole, setNewRole] = useState('');

  const load = async () => {
    const data = await listRoles();
    setRoles(data);
    if (data.length && !selected) {
      setSelected(data[0].name);
      setPerms(data[0].permissions || {});
    }
  };
  useEffect(() => { load(); }, []);

  const choose = (name: string) => {
    setSelected(name);
    const r = roles.find(r => r.name === name);
    setPerms(r?.permissions || {});
  };

  const toggle = (k: string) => setPerms({ ...perms, [k]: !perms[k] });

  const save = async () => {
    if (!selected) return;
    await updateRole(selected, perms);
    toast.success('Rol güncellendi');
    await load();
  };

  const create = async () => {
    if (!newRole) return;
    await createRole(newRole, {});
    setNewRole('');
    await load();
  };

  const remove = async () => {
    if (!selected) return;
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    await deleteRole(selected);
    setSelected('');
    setPerms({});
    await load();
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Roller ve İzinler</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-3 rounded shadow">
          <div className="font-semibold mb-2">Roller</div>
          <ul className="space-y-1">
            {roles.map(r => (
              <li key={r.name}>
                <button className={`w-full text-left px-2 py-1 rounded ${selected===r.name?'bg-blue-100':''}`} onClick={() => choose(r.name)}>{r.name}</button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex space-x-2">
            <input className="border p-1 flex-1" placeholder="Yeni rol adı" value={newRole} onChange={e=>setNewRole(e.target.value)} />
            <button className="px-3 py-1 bg-blue-600 text-white" onClick={create}>Ekle</button>
          </div>
          <button className="mt-2 px-3 py-1 bg-red-600 text-white" onClick={remove} disabled={!selected}>Sil</button>
        </div>
        <div className="bg-white p-3 rounded shadow md:col-span-2">
          <div className="font-semibold mb-2">İzinler</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PERMISSIONS.map(p => (
              <label key={p.key} className="flex items-center space-x-2 text-sm">
                <input type="checkbox" checked={!!perms[p.key]} onChange={() => toggle(p.key)} />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 text-right">
            <button className="px-4 py-2 bg-blue-600 text-white" onClick={save} disabled={!selected}>Kaydet</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
