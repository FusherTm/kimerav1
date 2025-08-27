import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import CategoryForm, { CategoryFormValues } from '../../components/CategoryForm';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
} from '../../lib/api/categories';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const token = '';
  const org = '';

  const loadCategories = async () => {
    const params: any = {};
    if (search) params.search = search;
    const data = await listCategories(token, org, params);
    setCategories(data);
  };

  useEffect(() => {
    loadCategories();
  }, [search]);

  const handleCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleSubmit = async (values: CategoryFormValues) => {
    if (editingCategory) {
      await updateCategory(token, org, editingCategory.id, values);
    } else {
      await createCategory(token, org, values);
    }
    setModalOpen(false);
    await loadCategories();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (confirm('Delete category?')) {
      await deleteCategory(token, org, category.id);
      await loadCategories();
    }
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Kategoriler</h1>
      <div className="mb-4 flex space-x-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ara"
          className="border p-2"
        />
        <button
          onClick={handleCreate}
          className="ml-auto bg-blue-500 text-white px-4 py-2"
        >
          Yeni Kategori Ekle
        </button>
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Code</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td className="border p-2">{c.name}</td>
              <td className="border p-2">{c.code}</td>
              <td className="border p-2 space-x-2 text-center">
                <button
                  onClick={() => handleEdit(c)}
                  className="px-2 py-1 bg-yellow-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c)}
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
        <CategoryForm
          initialValues={editingCategory || undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </Layout>
  );
}
