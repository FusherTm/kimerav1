import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { listPartners, Partner } from '../../lib/api/partners';
import { listProducts, Product } from '../../lib/api/products';
import { createOrder, OrderItemInput } from '../../lib/api/orders';

export default function NewOrderPage() {
  const [step, setStep] = useState(1);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<{ partner_id?: string; project_name?: string }>({});
  const [items, setItems] = useState<OrderItemInput[]>([]);

  const token = '';
  const org = '';
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const p = await listPartners(token, org);
      const pr = await listProducts(token, org, {});
      setPartners(p);
      setProducts(pr);
    };
    load();
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      { product_id: '', width: 0, height: 0, quantity: 1, unit_price: 0 },
    ]);
  };

  const updateItem = (index: number, field: keyof OrderItemInput, value: any) => {
    const newItems = [...items];
    // @ts-ignore
    newItems[index][field] = value;
    setItems(newItems);
  };

  const totalFor = (item: OrderItemInput) => {
    return (
      ((item.width || 0) / 1000) *
      ((item.height || 0) / 1000) *
      (item.quantity || 0) *
      (item.unit_price || 0)
    );
  };

  const grandTotal = items.reduce((sum, it) => sum + totalFor(it), 0);

  const handleSubmit = async () => {
    await createOrder(token, org, { ...form, items });
    router.push('/orders');
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Yeni Sipariş</h1>
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Partner</label>
            <select
              className="border p-2 w-full"
              value={form.partner_id || ''}
              onChange={(e) => setForm({ ...form, partner_id: e.target.value })}
            >
              <option value="">Seçiniz</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Proje Adı</label>
            <input
              className="border p-2 w-full"
              value={form.project_name || ''}
              onChange={(e) => setForm({ ...form, project_name: e.target.value })}
            />
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2"
            onClick={() => setStep(2)}
          >
            Devam
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="border p-2">Ürün</th>
                <th className="border p-2">En (mm)</th>
                <th className="border p-2">Boy (mm)</th>
                <th className="border p-2">Adet</th>
                <th className="border p-2">Birim Fiyat</th>
                <th className="border p-2">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="border p-2">
                    <select
                      className="border p-1"
                      value={item.product_id || ''}
                      onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                    >
                      <option value="">Seçiniz</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      className="border p-1 w-24"
                      value={item.width || 0}
                      onChange={(e) => updateItem(idx, 'width', Number(e.target.value))}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      className="border p-1 w-24"
                      value={item.height || 0}
                      onChange={(e) => updateItem(idx, 'height', Number(e.target.value))}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      className="border p-1 w-20"
                      value={item.quantity || 0}
                      onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      className="border p-1 w-24"
                      value={item.unit_price || 0}
                      onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))}
                    />
                  </td>
                  <td className="border p-2">{totalFor(item).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="bg-green-500 text-white px-4 py-2"
            onClick={addItem}
          >
            Satır Ekle
          </button>
          <div className="text-right font-bold">Genel Toplam: {grandTotal.toFixed(2)}</div>
          <div className="flex space-x-2">
            <button
              className="bg-gray-300 px-4 py-2"
              onClick={() => setStep(1)}
            >
              Geri
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2"
              onClick={handleSubmit}
            >
              Kaydet
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
