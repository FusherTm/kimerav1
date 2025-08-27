import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import PartnerForm, { PartnerFormValues } from '../../components/PartnerForm';
import {
  listPartners,
  createPartner,
  updatePartner,
  deletePartner,
  Partner,
} from '../../lib/api/partners';

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const token = '';
  const org = '';

  const loadPartners = async () => {
    const params: any = {};
    if (typeFilter !== 'All') params.type = typeFilter;
    if (search) params.search = search;
    const data = await listPartners(token, org, params);
    setPartners(data);
  };

  useEffect(() => {
    loadPartners();
  }, [search, typeFilter]);

  const handleCreate = () => {
    setEditingPartner(null);
    setModalOpen(true);
  };

  const handleSubmit = async (values: PartnerFormValues) => {
    if (editingPartner) {
      await updatePartner(token, org, editingPartner.id, values);
    } else {
      await createPartner(token, org, values);
    }
    setModalOpen(false);
    await loadPartners();
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setModalOpen(true);
  };

  const handleDelete = async (partner: Partner) => {
    if (confirm('Delete partner?')) {
      await deletePartner(token, org, partner.id);
      await loadPartners();
    }
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Müşteriler ve Tedarikçiler</h1>
      <div className="mb-4 flex space-x-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ara"
          className="border p-2"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border p-2"
        >
          <option value="All">All</option>
          <option value="CUSTOMER">CUSTOMER</option>
          <option value="SUPPLIER">SUPPLIER</option>
        </select>
        <button
          onClick={handleCreate}
          className="ml-auto bg-blue-500 text-white px-4 py-2"
        >
          Yeni Partner Ekle
        </button>
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Type</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-left">Phone</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.type}</td>
              <td className="border p-2">{p.email}</td>
              <td className="border p-2">{p.phone}</td>
              <td className="border p-2 space-x-2 text-center">
                <button
                  onClick={() => handleEdit(p)}
                  className="px-2 py-1 bg-yellow-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="px-2 py-1 bg-red-500 text-white"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modalOpen && (
        <PartnerForm
          initialValues={editingPartner || undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </Layout>
  );
}
