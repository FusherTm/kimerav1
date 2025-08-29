import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Account, TransactionInput, recordTransaction } from '../lib/api/finance';
import { listPartners, Partner } from '../lib/api/partners';
import toast from 'react-hot-toast';

const schema = z.object({
  account_id: z.string().min(1, 'Hesap gerekli'),
  partner_id: z.string().optional(),
  direction: z.enum(['IN', 'OUT']),
  amount: z.coerce.number().positive('Tutar pozitif olmalı'),
  transaction_date: z.string().optional(),
  description: z.string().optional(),
  method: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof schema>;

interface Props {
  accounts: Account[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TransactionForm({ accounts, onSuccess, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<TransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { direction: 'IN', transaction_date: new Date().toISOString().split('T')[0] },
  });

  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerSearch, setPartnerSearch] = useState('');
  const [useMisc, setUseMisc] = useState(false);

  const token = '';
  const org = '';

  useEffect(() => {
    const loadPartners = async () => {
      const data = await listPartners(partnerSearch ? { search: partnerSearch } : {});
      const sorted = [...data].sort((a, b) => {
        const an = a.name === 'Muhtelif Müşteri' ? 0 : 1;
        const bn = b.name === 'Muhtelif Müşteri' ? 0 : 1;
        if (an !== bn) return an - bn;
        return a.name.localeCompare(b.name);
      });
      setPartners(sorted);
    };
    loadPartners();
  }, [partnerSearch]);

  useEffect(() => {
    if (useMisc) {
      const misc = partners.find(p => p.name === 'Muhtelif Müşteri');
      if (misc) setValue('partner_id' as any, misc.id as any);
    }
  }, [useMisc, partners, setValue]);

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      await recordTransaction(token, org, data as TransactionInput);
      reset();
      toast.success('İşlem kaydedildi');
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Kayıt başarısız');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded w-96 space-y-4">
        <h2 className="text-lg font-bold">Yeni İşlem</h2>
        <div>
          <label className="block">Hesap</label>
          <select className="border p-2 w-full" {...register('account_id')}>
            <option value="">Seçiniz</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          {errors.account_id && <p className="text-red-500 text-sm">{String(errors.account_id.message)}</p>}
        </div>
        <div>
          <label className="block">Partner</label>
          <div className="flex items-center mb-2">
            <input id="misc" type="checkbox" className="mr-2" checked={useMisc} onChange={(e) => setUseMisc(e.target.checked)} />
            <label htmlFor="misc" className="text-sm">Muhtelif satış</label>
          </div>
          {!useMisc && (
            <>
              <input
                value={partnerSearch}
                onChange={(e) => setPartnerSearch(e.target.value)}
                placeholder="Ara"
                className="border p-2 w-full mb-2"
              />
              <select className="border p-2 w-full" {...register('partner_id')}>
                <option value="">Seçiniz</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </>
          )}
          {useMisc && (
            <div className="text-xs text-gray-600 mb-2">İşlem Muhtelif Müşteri carisine yazılacak.</div>
          )}
        </div>
        <div>
          <label className="block">Yön</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-1">
              <input type="radio" value="IN" {...register('direction')} />
              <span>Gelir</span>
            </label>
            <label className="flex items-center space-x-1">
              <input type="radio" value="OUT" {...register('direction')} />
              <span>Gider</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block">Tutar</label>
          <input type="number" step="0.01" className="border p-2 w-full" {...register('amount', { valueAsNumber: true })} />
          {errors.amount && <p className="text-red-500 text-sm">{String(errors.amount.message)}</p>}
        </div>
        <div>
          <label className="block">Tarih</label>
          <input type="date" className="border p-2 w-full" {...register('transaction_date')} />
        </div>
        <div>
          <label className="block">Açıklama</label>
          <input className="border p-2 w-full" {...register('description')} />
        </div>
        <div>
          <label className="block">Yöntem</label>
          <input className="border p-2 w-full" {...register('method')} />
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300">Vazgeç</button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white">Kaydet</button>
        </div>
      </form>
    </div>
  );
}

