import { useState } from 'react';
import Layout from '../../components/Layout';
import { createTenant } from '../../lib/api/admin';
import toast from 'react-hot-toast';

export default function NewTenantPage() {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    admin_email: '',
    admin_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; name: string; slug: string } | null>(null);

  const suggestSlug = (name: string) => name
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 40);

  const submit = async () => {
    if (!form.name || !form.slug) {
      toast.error('İsim ve slug zorunlu');
      return;
    }
    setLoading(true);
    try {
      const res = await createTenant({
        name: form.name,
        slug: form.slug,
        admin_email: form.admin_email || undefined,
        admin_password: form.admin_password || undefined,
      });
      toast.success('Firma oluşturuldu');
      setResult({ id: res.id, name: res.name, slug: res.slug });
      setForm({ name: '', slug: '', admin_email: '', admin_password: '' });
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Oluşturma başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Yeni Firma</h1>
      <div className="bg-white p-4 rounded shadow max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm">Firma Adı</label>
            <input
              className="border p-2 w-full"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({ ...f, name, slug: f.slug || suggestSlug(name) }));
              }}
              placeholder="Örn. Özgür Cam"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm">Slug</label>
            <input
              className="border p-2 w-full"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="ozgur-cam"
            />
            <p className="text-xs text-gray-500 mt-1">URL dostu kısa ad; otomatik önerilir, düzenleyebilirsiniz.</p>
          </div>
          <div>
            <label className="block text-sm">Admin E-posta (opsiyonel)</label>
            <input
              className="border p-2 w-full"
              type="email"
              value={form.admin_email}
              onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
              placeholder="admin@firma.com"
            />
          </div>
          <div>
            <label className="block text-sm">Admin Şifre (opsiyonel)</label>
            <input
              className="border p-2 w-full"
              type="password"
              value={form.admin_password}
              onChange={(e) => setForm({ ...form, admin_password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white disabled:opacity-60"
            onClick={submit}
            disabled={loading}
          >{loading ? 'Oluşturuluyor...' : 'Oluştur'}</button>
        </div>
        {result && (
          <div className="mt-4 text-sm text-green-700">
            <div>Oluşturulan Firma: <b>{result.name}</b> ({result.slug})</div>
            <div>Bu firmayla çalışmak için X-Org-Slug: <code className="bg-gray-100 px-1 py-0.5 rounded">{result.slug}</code></div>
          </div>
        )}
      </div>
    </Layout>
  );
}

