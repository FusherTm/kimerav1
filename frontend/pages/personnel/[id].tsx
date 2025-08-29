import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Employee, getEmployee, listLeaves, createLeave, updateEmployee } from '../../lib/api/personnel';
import toast from 'react-hot-toast';

export default function EmployeeDetail() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [emp, setEmp] = useState<Employee | null>(null);
  const [leaves, setLeaves] = useState<Array<any>>([]);
  const [note, setNote] = useState('');
  const [leaveModal, setLeaveModal] = useState<{ start_date: string; end_date: string; days: number; leave_type: string; note: string } | null>(null);

  const load = async () => {
    if (!id) return;
    const e = await getEmployee(id);
    setEmp(e);
    setNote(e.notes || '');
    const lv = await listLeaves({ employee_id: id });
    setLeaves(lv);
  };
  useEffect(() => { load(); }, [id]);

  const saveNote = async () => {
    if (!emp) return;
    await updateEmployee(emp.id, { ...emp, notes: note });
    toast.success('Not kaydedildi');
    await load();
  };

  return (
    <Layout>
      {emp ? (
        <div className="space-y-4">
          <h1 className="text-xl font-bold">{emp.first_name} {emp.last_name}</h1>
          <div className="bg-white p-3 rounded shadow">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div><div className="text-gray-500">Pozisyon</div><div className="font-semibold">{emp.position || '-'}</div></div>
              <div><div className="text-gray-500">Maaş</div><div className="font-semibold">{emp.salary ?? '-'}</div></div>
              <div><div className="text-gray-500">Sigorta</div><div className="font-semibold">{emp.insurance ?? '-'}</div></div>
              <div><div className="text-gray-500">E-posta</div><div className="font-semibold">{emp.email || '-'}</div></div>
              <div><div className="text-gray-500">Telefon</div><div className="font-semibold">{emp.phone || '-'}</div></div>
              <div><div className="text-gray-500">İşe Başlama</div><div className="font-semibold">{emp.hire_date || '-'}</div></div>
            </div>
          </div>

          <div className="bg-white p-3 rounded shadow">
            <div className="flex items-center justify-between mb-2"><div className="font-semibold">İzinler</div><button className="px-2 py-1 bg-emerald-600 text-white" onClick={()=> setLeaveModal({ start_date:'', end_date:'', days:0, leave_type:'ANNUAL', note:'' })}>İzin Ekle</button></div>
            <table className="min-w-full">
              <thead><tr><th className="border p-2">Başlangıç</th><th className="border p-2">Bitiş</th><th className="border p-2">Gün</th><th className="border p-2">Tür</th><th className="border p-2">Not</th></tr></thead>
              <tbody>
                {leaves.length ? leaves.map(l => (
                  <tr key={l.id}><td className="border p-2">{l.start_date}</td><td className="border p-2">{l.end_date}</td><td className="border p-2">{l.days}</td><td className="border p-2">{l.leave_type || '-'}</td><td className="border p-2">{l.note || '-'}</td></tr>
                )) : (<tr><td className="p-3 text-center" colSpan={5}>Kayıt yok</td></tr>)}
              </tbody>
            </table>
          </div>

          <div className="bg-white p-3 rounded shadow">
            <div className="font-semibold mb-2">Notlar</div>
            <textarea className="border p-2 w-full h-28" value={note} onChange={e=> setNote(e.target.value)} />
            <div className="text-right mt-2"><button className="px-3 py-1 bg-blue-600 text-white" onClick={saveNote}>Kaydet</button></div>
          </div>
        </div>
      ) : (
        <div>Yükleniyor...</div>
      )}

      {leaveModal && emp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-[520px] space-y-3">
            <h2 className="text-lg font-semibold">İzin Ekle</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm">Başlangıç</label>
                <input type="date" className="border p-2 w-full" value={leaveModal.start_date} onChange={e=> setLeaveModal({ ...leaveModal, start_date: e.target.value })}/>
              </div>
              <div>
                <label className="block text-sm">Bitiş</label>
                <input type="date" className="border p-2 w-full" value={leaveModal.end_date} onChange={e=> setLeaveModal({ ...leaveModal, end_date: e.target.value })}/>
              </div>
              <div>
                <label className="block text-sm">Gün</label>
                <input type="number" className="border p-2 w-full" value={leaveModal.days} onChange={e=> setLeaveModal({ ...leaveModal, days: Number(e.target.value) })}/>
              </div>
              <div>
                <label className="block text-sm">Tür</label>
                <select className="border p-2 w-full" value={leaveModal.leave_type} onChange={e=> setLeaveModal({ ...leaveModal, leave_type: e.target.value })}>
                  <option value="ANNUAL">Yıllık</option>
                  <option value="SICK">Rapor</option>
                  <option value="UNPAID">Ücretsiz</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm">Not</label>
                <input className="border p-2 w-full" value={leaveModal.note} onChange={e=> setLeaveModal({ ...leaveModal, note: e.target.value })}/>
              </div>
            </div>
            <div className="text-right space-x-2">
              <button className="px-4 py-2 bg-gray-300" onClick={()=> setLeaveModal(null)}>Vazgeç</button>
              <button className="px-4 py-2 bg-blue-600 text-white" onClick={async ()=>{
                try { await createLeave({ employee_id: emp.id, ...leaveModal }); toast.success('İzin eklendi'); setLeaveModal(null); await load(); } catch (e:any) { toast.error(e?.response?.data?.detail || 'İzin eklenemedi'); }
              }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

