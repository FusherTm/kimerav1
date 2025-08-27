import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const partnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['CUSTOMER', 'SUPPLIER', 'BOTH']),
  contact_person: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  tax_number: z.string().optional(),
});

export type PartnerFormValues = z.infer<typeof partnerSchema>;

interface PartnerFormProps {
  initialValues?: PartnerFormValues;
  onSubmit: (data: PartnerFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export default function PartnerForm({ initialValues, onSubmit, onCancel }: PartnerFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: initialValues || { type: 'CUSTOMER' },
  });

  const submitHandler = async (data: PartnerFormValues) => {
    await onSubmit(data);
    reset({ type: 'CUSTOMER' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form onSubmit={handleSubmit(submitHandler)} className="bg-white p-6 rounded w-96 space-y-4">
        <h2 className="text-lg font-bold">Partner</h2>
        <div>
          <label className="block">Name</label>
          <input className="border p-2 w-full" {...register('name')} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block">Type</label>
          <select className="border p-2 w-full" {...register('type')}>
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="SUPPLIER">SUPPLIER</option>
            <option value="BOTH">BOTH</option>
          </select>
        </div>
        <div>
          <label className="block">Contact Person</label>
          <input className="border p-2 w-full" {...register('contact_person')} />
        </div>
        <div>
          <label className="block">Email</label>
          <input className="border p-2 w-full" {...register('email')} />
        </div>
        <div>
          <label className="block">Phone</label>
          <input className="border p-2 w-full" {...register('phone')} />
        </div>
        <div>
          <label className="block">Address</label>
          <input className="border p-2 w-full" {...register('address')} />
        </div>
        <div>
          <label className="block">Tax Number</label>
          <input className="border p-2 w-full" {...register('tax_number')} />
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white">Save</button>
        </div>
      </form>
    </div>
  );
}
