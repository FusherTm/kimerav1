import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyPermissions } from '../lib/api/auth';
import { branding } from '../lib/branding';

export default function Layout({ children }: { children: ReactNode }) {
  const [perms, setPerms] = useState<{ is_admin: boolean; p: Record<string, boolean> } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMyPermissions();
        setPerms({ is_admin: me.is_admin, p: me.permissions || {} });
      } catch {
        setPerms({ is_admin: false, p: {} });
      }
    })();
  }, []);

  const allow = (key: string) => Boolean(perms?.is_admin || perms?.p[key]);

  const norm = (u?: string) => (u ? (u.startsWith('http') || u.startsWith('/') ? u : `/${u}`) : '');

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-56 bg-white shadow p-4 space-y-2">
        <nav className="flex flex-col space-y-2 text-sm">
          <Link href="/">Gösterge Paneli</Link>
          {allow('partner:view') && <Link href="/partners">Cariler</Link>}
          {allow('product:view') && <Link href="/products">Ürünler</Link>}
          {allow('category:view') && <Link href="/categories">Kategoriler</Link>}
          <Link href="/stock">Stok</Link>
          {allow('personnel:view') && <Link href="/personnel">Personel</Link>}
          {allow('production:view') && <Link href="/production">Üretim Paneli</Link>}
          {(allow('finance:view') || allow('asset:view') || allow('invoice:view')) && (
            <details open>
              <summary className="cursor-pointer select-none">Finans</summary>
              <div className="ml-3 mt-1 flex flex-col space-y-1">
                {allow('finance:view') && <Link href="/finance">Finansal İşlemler</Link>}
                {allow('asset:view') && <Link href="/assets">Varlıklar</Link>}
                {allow('invoice:view') && <Link href="/invoices">Faturalar</Link>}
                {allow('order:view') && <Link href="/orders">Siparişler</Link>}
              </div>
            </details>
          )}
          {allow('admin:view') && (
            <details>
              <summary className="cursor-pointer select-none">Yönetim</summary>
              <div className="ml-3 mt-1 flex flex-col space-y-1">
                <Link href="/admin/roles">Roller</Link>
                <Link href="/admin/users">Kullanıcı Rolleri</Link>
                <Link href="/admin/tenants">Yeni Firma</Link>
              </div>
            </details>
          )}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="bg-white shadow p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {branding.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={norm(branding.logoUrl)} alt={branding.companyName} className="h-6 w-auto" />
            )}
            <span className="text-xl md:text-2xl font-bold text-blue-600">{branding.companyName || 'Firma'}</span>
          </div>
          <button
            className="text-sm text-gray-600 hover:text-gray-900"
            onClick={() => { try { localStorage.removeItem('access_token'); localStorage.removeItem('org_slug'); } catch {} window.location.href = '/login'; }}
          >
            Çıkış
          </button>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}

