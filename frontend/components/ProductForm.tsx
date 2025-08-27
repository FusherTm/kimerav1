import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { listCategories, Category } from '../lib/api/categories';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category_id: z.string().uuid().optional().or(z.literal('')),
  base_price_sqm: z.coerce.number().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialValues?: ProductFormValues;
  onSubmit: (data: ProductFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ initialValues, onSubmit, onCancel }: ProductFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialValues || {},
  });

  const submitHandler = async (data: ProductFormValues) => {
    await onSubmit(data);
    reset();
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const token = '';
  const org = '';

  useEffect(() => {
    async function loadCategories() {
      const data = await listCategories(token, org);
      setCategories(data);
    }
    loadCategories();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form onSubmit={handleSubmit(submitHandler)} className="bg-white p-6 rounded w-96 space-y-4">
        <h2 className="text-lg font-bold">Product</h2>
        <div>
          <label className="block">Name</label>
          <input className="border p-2 w-full" {...register('name')} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block">SKU</label>
          <input className="border p-2 w-full" {...register('sku')} />
          {errors.sku && <p className="text-red-500 text-sm">{errors.sku.message}</p>}
        </div>
        <div>
          <label className="block">Category</label>
          <select className="border p-2 w-full" {...register('category_id')}>
            <option value="">Select</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block">Base Price (m²)</label>
          <input type="number" step="0.01" className="border p-2 w-full" {...register('base_price_sqm')} />
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white">Save</button>
        </div>
      </form>
    </div>
  );
}
