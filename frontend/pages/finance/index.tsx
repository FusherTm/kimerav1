import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import TransactionForm from '../../components/TransactionForm';
import { getAccounts, Account } from '../../lib/api/finance';

export default function FinancePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const token = '';
  const org = '';

  const loadAccounts = async () => {
    const data = await getAccounts(token, org);
    setAccounts(data);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSuccess = async () => {
    setModalOpen(false);
    await loadAccounts();
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Finans Yönetimi</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((a) => (
          <div key={a.id} className="bg-white p-4 shadow">
            <h2 className="text-lg font-semibold">{a.name}</h2>
            <p className="text-gray-600">Bakiye: {a.current_balance}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => setModalOpen(true)}
        className="mt-4 bg-blue-500 text-white px-4 py-2"
      >
        Yeni İşlem Ekle
      </button>
      {modalOpen && (
        <TransactionForm
          accounts={accounts}
          onSuccess={handleSuccess}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </Layout>
  );
}

