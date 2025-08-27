import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ProductForm, { ProductFormValues } from '../../components/ProductForm';
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Product,
} from '../../lib/api/products';
import { listCategories, Category } from '../../lib/api/categories';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const token = '';
  const org = '';

  const loadCategories = async () => {
    const data = await listCategories(token, org);
    setCategories(data);
  };

  const loadProducts = async () => {
    const params: any = {};
    if (search) params.search = search;
    if (categoryFilter !== 'All') params.category_id = categoryFilter;
    const data = await listProducts(token, org, params);
    setProducts(data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, categoryFilter]);

  const handleCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleSubmit = async (values: ProductFormValues) => {
    if (editingProduct) {
      await updateProduct(token, org, editingProduct.id, values);
    } else {
      await createProduct(token, org, values);
    }
    setModalOpen(false);
    await loadProducts();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (confirm('Delete product?')) {
      await deleteProduct(token, org, product.id);
      await loadProducts();
    }
  };

  const getCategoryName = (id?: string) =>
    categories.find((c) => c.id === id)?.name || '';

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Ürünler</h1>
      <div className="mb-4 flex space-x-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ara"
          className="border p-2"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border p-2"
        >
          <option value="All">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleCreate}
          className="ml-auto bg-blue-500 text-white px-4 py-2"
        >
          Yeni Ürün Ekle
        </button>
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">SKU</th>
            <th className="border p-2 text-left">Category</th>
            <th className="border p-2 text-left">Base Price (m²)</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.sku}</td>
              <td className="border p-2">{getCategoryName(p.category_id)}</td>
              <td className="border p-2">{p.base_price_sqm}</td>
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
        <ProductForm
          initialValues={editingProduct || undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </Layout>
  );
}
