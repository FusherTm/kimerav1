import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import TransactionForm from '../../components/TransactionForm';
import AccountForm from '../../components/AccountForm';
import ConnectionForm from '../../components/ConnectionForm';
import { getAccounts, getRecentTransactions, Account, Transaction } from '../../lib/api/finance';
import api from '../../lib/api/client';

export default function FinancePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);
  const [recent, setRecent] = useState<Transaction[]>([]);

  const token = '';
  const org = '';

  const loadAccounts = async () => {
    const data = await getAccounts(token, org);
    setAccounts(data);
  };
  const loadRecent = async () => {
    const data = await getRecentTransactions(10);
    setRecent(data || []);
  };

  useEffect(() => {
    loadAccounts();
    loadRecent();
  }, []);

  const handleSuccess = async () => {
    setModalOpen(false);
    await loadAccounts();
    await loadRecent();
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Finans Yönetimi</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.length > 0 ? (
          accounts.map((a) => (
            <div key={a.id} className="bg-white p-4 shadow">
              <h2 className="text-lg font-semibold">{a.name}</h2>
              <p className="text-gray-600">Bakiye: {a.current_balance}</p>
            </div>
          ))
        ) : (
          <p className="col-span-2 text-center p-4">
            No accounts found.
          </p>
        )}
      </div>
      <button
        onClick={() => setModalOpen(true)}
        className="mt-4 bg-blue-500 text-white px-4 py-2"
      >
        Yeni İşlem Ekle
      </button>
      <button
        onClick={() => setAccountModalOpen(true)}
        className="mt-4 ml-2 bg-green-600 text-white px-4 py-2"
      >
        Yeni Hesap Ekle
      </button>
      <button
        onClick={() => setConnectionModalOpen(true)}
        className="mt-4 ml-2 bg-purple-600 text-white px-4 py-2"
      >
        Yeni Bağlantı
      </button>
      {modalOpen && (
        <TransactionForm
          accounts={accounts}
          onSuccess={handleSuccess}
          onCancel={() => setModalOpen(false)}
        />
      )}
      {accountModalOpen && (
        <AccountForm
          onSuccess={async () => { setAccountModalOpen(false); await loadAccounts(); }}
          onCancel={() => setAccountModalOpen(false)}
        />
      )}
      {connectionModalOpen && (
        <ConnectionForm
          onSuccess={() => { setConnectionModalOpen(false); loadRecent(); }}
          onCancel={() => setConnectionModalOpen(false)}
        />
      )}
      <div className="mt-8 bg-white p-4 shadow rounded">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Son İşlemler</h2>
          <span className="text-sm text-gray-500">Son 10 kayıt</span>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="border p-2 text-left">Tarih</th>
                <th className="border p-2 text-left">Açıklama</th>
                <th className="border p-2 text-left">Yöntem</th>
                <th className="border p-2 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {recent.length > 0 ? recent.map((t) => {
                const isIn = String(t.direction) === 'IN';
                const amount = Number(t.amount || 0);
                return (
                  <tr key={t.id}>
                    <td className="border p-2">{t.transaction_date ? String(t.transaction_date).slice(0, 10) : '-'}</td>
                    <td className="border p-2">{t.description || '-'}</td>
                    <td className="border p-2">{t.method || '-'}</td>
                    <td className={"border p-2 text-right font-semibold " + (isIn ? 'text-green-600' : 'text-red-600')}>
                      {isIn ? '+' : '-'} {amount.toFixed(2)}
                    </td>
                  </tr>
                );
              }) : (
                <tr><td className="p-3 text-center" colSpan={4}>Kayıt yok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
