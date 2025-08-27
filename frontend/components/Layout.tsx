import { ReactNode } from 'react';
import Link from 'next/link';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-48 bg-white shadow p-4 space-y-2">
        <nav className="flex flex-col space-y-2">
          <Link href="/">Dashboard</Link>
          <Link href="/partners">Partners</Link>
          <Link href="/products">Products</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/orders">Siparişler</Link>
          <Link href="/production">Üretim Paneli</Link>
          <Link href="/finance">Finans</Link>
        </nav>
      </aside>
      <div className="flex-1">
        <header className="bg-white shadow p-4">ERP</header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
