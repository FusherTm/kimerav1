import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { AccountInput, createAccount } from '../lib/api/finance';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AccountForm({ onSuccess, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AccountInput>({
    defaultValues: { type: 'CASH' },
  });
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = async (data: AccountInput) => {
    setSubmitting(true);
    try {
      await createAccount('', '', data);
      reset();
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded w-96 space-y-4">
        <h2 className="text-lg font-bold">Yeni Hesap</h2>
        <div>
          <label className="block">Ad</label>
          <input className="border p-2 w-full" {...register('name', { required: 'Zorunlu' })} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block">Tür</label>
          <select className="border p-2 w-full" {...register('type', { required: 'Zorunlu' })}>
            <option value="CASH">CASH</option>
            <option value="BANK">BANK</option>
          </select>
        </div>
        <div>
          <label className="block">Başlangıç Bakiye</label>
          <input type="number" step="0.01" className="border p-2 w-full" {...register('current_balance', { valueAsNumber: true })} />
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300">Vazgeç</button>
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-500 text-white">Kaydet</button>
        </div>
      </form>
    </div>
  );
}

