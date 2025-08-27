import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">ERP</header>
      <main className="p-4">{children}</main>
    </div>
  );
}
