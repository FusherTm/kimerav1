import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { listPartners, Partner } from '../../lib/api/partners';
import { listProducts, Product } from '../../lib/api/products';
import { createOrder, OrderItemInput } from '../../lib/api/orders';
import toast from 'react-hot-toast';

export default function NewOrderPage() {
  const [step, setStep] = useState(1);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<{ partner_id?: string; project_name?: string }>({});
  const [items, setItems] = useState<OrderItemInput[]>([]);
  const [mode, setMode] = useState<'dimensions' | 'area'>('dimensions');

  const token = '';
  const org = '';
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const p = await listPartners();
      const pr = await listProducts(token, org, {});
      setPartners(p);
      setProducts(pr);
    };
    load();
  }, []);

  const addItem = () => {
    if (mode === 'area') {
      setItems([
        ...items,
        { product_id: '', area_sqm: 0, quantity: 1, unit_price: 0 },
      ]);
    } else {
      setItems([
        ...items,
        { product_id: '', width: 0, height: 0, quantity: 1, unit_price: 0 },
      ]);
    }
  };

  const updateItem = (index: number, field: keyof OrderItemInput, value: any) => {
    const newItems = [...items];
    // @ts-ignore
    newItems[index][field] = value;
    if (field === 'product_id') {
      const p = products.find(pr => pr.id === String(value));
      if (p && p.base_price_sqm != null) {
        // default unit price from product; user can override afterwards
        // @ts-ignore
        newItems[index].unit_price = p.base_price_sqm as any;
      }
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const totalFor = (item: OrderItemInput) => {
    const unit = item.unit_price || 0;
    if (item.area_sqm != null && item.area_sqm > 0) {
      return (item.area_sqm || 0) * unit;
    }
    return (
      ((item.width || 0) / 1000) *
      ((item.height || 0) / 1000) *
      (item.quantity || 0) *
      unit
    );
  };

  const grandTotal = items.reduce((sum, it) => sum + totalFor(it), 0);

  const handleSubmit = async () => {
    try {
      // sanitize payload: empty strings -> undefined
      const safeForm = {
        ...form,
        partner_id: form.partner_id && form.partner_id !== '' ? form.partner_id : undefined,
      } as typeof form;
      const safeItems = items.map((it) => ({
        ...it,
        product_id: it.product_id && it.product_id !== '' ? it.product_id : undefined,
      }));
      await createOrder(token, org, { ...safeForm, items: safeItems });
      toast.success('Order created');
      setForm({});
      setItems([]);
      router.push('/orders');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create order');
    }
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
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Satır modu:</span>
            <button
              className={`px-3 py-1 border ${mode === 'dimensions' ? 'bg-blue-600 text-white' : ''}`}
              onClick={() => setMode('dimensions')}
            >Ölçülerle</button>
            <button
              className={`px-3 py-1 border ${mode === 'area' ? 'bg-blue-600 text-white' : ''}`}
              onClick={() => setMode('area')}
            >Toplam m2 ile</button>
          </div>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="border p-2">Ürün</th>
                {mode === 'area' ? (
                  <>
                    <th className="border p-2">Toplam m²</th>
                    <th className="border p-2">Birim Fiyat</th>
                    <th className="border p-2">Toplam</th>
                    <th className="border p-2">İşlem</th>
                  </>
                ) : (
                  <>
                    <th className="border p-2">En (mm)</th>
                    <th className="border p-2">Boy (mm)</th>
                    <th className="border p-2">Adet</th>
                    <th className="border p-2">Birim Fiyat</th>
                    <th className="border p-2">Toplam</th>
                    <th className="border p-2">İşlem</th>
                  </>
                )}
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
                  {mode === 'area' ? (
                    <>
                      <td className="border p-2">
                        <input
                          type="number"
                          step="0.01"
                          className="border p-1 w-24"
                          value={item.area_sqm ?? 0}
                          onChange={(e) => updateItem(idx, 'area_sqm', Number(e.target.value))}
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="number"
                          step="0.01"
                          className="border p-1 w-24"
                          value={item.unit_price || 0}
                          onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))}
                        />
                      </td>
                      <td className="border p-2">{totalFor(item).toFixed(2)}</td>
                      <td className="border p-2 text-center">
                        <button className="text-red-600 underline" onClick={() => removeItem(idx)}>Sil</button>
                      </td>
                    </>
                  ) : (
                    <>
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
                      <td className="border p-2 text-center">
                        <button className="text-red-600 underline" onClick={() => removeItem(idx)}>Sil</button>
                      </td>
                    </>
                  )}
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
