import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialValues?: CategoryFormValues;
  onSubmit: (data: CategoryFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export default function CategoryForm({ initialValues, onSubmit, onCancel }: CategoryFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialValues || {},
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded w-96 space-y-4">
        <h2 className="text-lg font-bold">Category</h2>
        <div>
          <label className="block">Name</label>
          <input className="border p-2 w-full" {...register('name')} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block">Code</label>
          <input className="border p-2 w-full" {...register('code')} />
          {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white">Save</button>
        </div>
      </form>
    </div>
  );
}
