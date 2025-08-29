import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { Employee, listEmployees, createEmployee, updateEmployee, deleteEmployee, getPersonnelSummary, createLeave, restoreEmployee, getPersonnelMonthly } from '../../lib/api/personnel';
import toast from 'react-hot-toast';

export default function PersonnelPage() {
  const [rows, setRows] = useState<Employee[]>([]);
  const [onlyActive, setOnlyActive] = useState(true);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [summary, setSummary] = useState<{ total_employees: number; total_salary: number; total_insurance: number; leaves: Record<string, number> } | null>(null);
  const [monthly, setMonthly] = useState<Array<{ month: number; salary_total: number; insurance_total: number }>>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<any>({ first_name: '', last_name: '', position: '', salary: '', insurance: '', email: '', phone: '', hire_date: '', notes: '' });
  const [leaveModal, setLeaveModal] = useState<{ employee_id: string; start_date: string; end_date: string; days: number; leave_type: string; note: string } | null>(null);

  const load = async () => {
    const [emps, sum, mon] = await Promise.all([
      listEmployees({ only_active: onlyActive }),
      getPersonnelSummary({ year }),
      getPersonnelMonthly({ year }),
    ]);
    setRows(emps);
    setSummary(sum);
    setMonthly(mon.months || []);
  };
  useEffect(() => { load(); }, [onlyActive, year]);

  const leavesFor = useMemo(() => summary?.leaves || {}, [summary]);

  const openNew = () => { setEditing(null); setForm({ first_name: '', last_name: '', position: '', salary: '', insurance: '', email: '', phone: '', hire_date: '', notes: '' }); setModalOpen(true); };
  const openEdit = (e: Employee) => { setEditing(e); setForm({ ...e, salary: e.salary ?? '', insurance: e.insurance ?? '', hire_date: e.hire_date ?? '' }); setModalOpen(true); };

  const save = async () => {
    try {
      const payload = { ...form, salary: form.salary? Number(form.salary): undefined, insurance: form.insurance? Number(form.insurance): undefined };
      if (editing) await updateEmployee(editing.id, payload); else await createEmployee(payload);
      toast.success('Kaydedildi');
      setModalOpen(false);
      await load();
    } catch (e:any) { toast.error(e?.response?.data?.detail || 'Kayıt başarısız'); }
  };

  const remove = async (id: string) => { if (!confirm('Personeli pasif etmek istediğinize emin misiniz?')) return; await deleteEmployee(id); await load(); };
  const restore = async (id: string) => { await restoreEmployee(id); await load(); };

  return (
    <Layout>
      <div className="flex items-end justify-between mb-4">
        <h1 className="text-xl font-bold">Personel</h1>
        <div className="flex items-center space-x-2">
          <label className="text-sm flex items-center space-x-1"><input type="checkbox" checked={onlyActive} onChange={e=>setOnlyActive(e.target.checked)} /><span>Aktif</span></label>
          <select className="border p-1" value={year} onChange={e=>setYear(Number(e.target.value))}>
            {Array.from({length:5}).map((_,i)=>{const y=new Date().getFullYear()-i; return <option key={y} value={y}>{y}</option>})}
          </select>
          <button className="bg-blue-600 text-white px-4 py-2" onClick={openNew}>Yeni Personel</button>
        </div>
      </div>

      <div className="bg-white p-3 rounded shadow mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><div className="text-gray-500">Toplam Personel</div><div className="text-xl font-semibold">{summary?.total_employees ?? 0}</div></div>
          <div><div className="text-gray-500">Toplam Maaş</div><div className="text-xl font-semibold">{(summary?.total_salary ?? 0).toFixed(2)}</div></div>
          <div><div className="text-gray-500">Toplam Sigorta</div><div className="text-xl font-semibold">{(summary?.total_insurance ?? 0).toFixed(2)}</div></div>
          <div><div className="text-gray-500">Yıl</div><div className="text-xl font-semibold">{year}</div></div>
        </div>
        {monthly.length > 0 && (
          <div className="mt-4">
            <SimpleLines data={monthly} />
          </div>
        )}
      </div>

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="border p-2 text-left">Ad Soyad</th>
            <th className="border p-2 text-left">Pozisyon</th>
            <th className="border p-2 text-right">Maaş</th>
            <th className="border p-2 text-right">Sigorta</th>
            <th className="border p-2 text-right">Yıllık İzin (gün)</th>
            <th className="border p-2">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map(r => (
            <tr key={r.id}>
              <td className="border p-2"><a className="text-blue-600" href={`/personnel/${r.id}`}>{r.first_name} {r.last_name}</a></td>
              <td className="border p-2">{r.position || '-'}</td>
              <td className="border p-2 text-right">{r.salary ?? '-'}</td>
              <td className="border p-2 text-right">{r.insurance ?? '-'}</td>
              <td className="border p-2 text-right">{leavesFor[r.id] ?? 0}</td>
              <td className="border p-2 text-center space-x-2">
                <button className="px-2 py-1 bg-yellow-400" onClick={()=>openEdit(r)}>Düzenle</button>
                <button className="px-2 py-1 bg-emerald-600 text-white" onClick={()=> setLeaveModal({ employee_id: r.id, start_date: '', end_date: '', days: 0, leave_type: 'ANNUAL', note: '' })}>İzin Ekle</button>
                {r.is_active ? (
                  <button className="px-2 py-1 bg-red-600 text-white" onClick={()=>remove(r.id)}>Pasif Et</button>
                ) : (
                  <button className="px-2 py-1 bg-gray-600 text-white" onClick={()=>restore(r.id)}>Geri Al</button>
                )}
              </td>
            </tr>
          )) : (
            <tr><td className="p-4 text-center" colSpan={6}>Kayıt yok</td></tr>
          )}
        </tbody>
      </table>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-[720px] space-y-3">
            <h2 className="text-lg font-semibold">{editing? 'Personel Düzenle':'Yeni Personel'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><label className="block text-sm">Ad</label><input className="border p-2 w-full" value={form.first_name} onChange={e=>setForm({...form, first_name:e.target.value})}/></div>
              <div><label className="block text-sm">Soyad</label><input className="border p-2 w-full" value={form.last_name} onChange={e=>setForm({...form, last_name:e.target.value})}/></div>
              <div><label className="block text-sm">Pozisyon</label><input className="border p-2 w-full" value={form.position} onChange={e=>setForm({...form, position:e.target.value})}/></div>
              <div><label className="block text-sm">Maaş</label><input type="number" className="border p-2 w-full" value={form.salary} onChange={e=>setForm({...form, salary:e.target.value})}/></div>
              <div><label className="block text-sm">Sigorta</label><input type="number" className="border p-2 w-full" value={form.insurance} onChange={e=>setForm({...form, insurance:e.target.value})}/></div>
              <div><label className="block text-sm">İşe Başlama</label><input type="date" className="border p-2 w-full" value={form.hire_date} onChange={e=>setForm({...form, hire_date:e.target.value})}/></div>
              <div><label className="block text-sm">E-posta</label><input className="border p-2 w-full" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/></div>
              <div><label className="block text-sm">Telefon</label><input className="border p-2 w-full" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/></div>
              <div className="md:col-span-3"><label className="block text-sm">Notlar</label><textarea className="border p-2 w-full" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})}/></div>
            </div>
            <div className="text-right space-x-2">
              <button className="px-4 py-2 bg-gray-300" onClick={()=>setModalOpen(false)}>Vazgeç</button>
              <button className="px-4 py-2 bg-blue-600 text-white" onClick={save}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {leaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-[520px] space-y-3">
            <h2 className="text-lg font-semibold">İzin Ekle</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm">Başlangıç</label>
                <input type="date" className="border p-2 w-full" value={leaveModal.start_date} onChange={e=>{
                  const start = e.target.value; const days = computeDays(start, leaveModal.end_date); setLeaveModal({...leaveModal, start_date:start, days});
                }}/>
              </div>
              <div>
                <label className="block text-sm">Bitiş</label>
                <input type="date" className="border p-2 w-full" value={leaveModal.end_date} onChange={e=>{
                  const end = e.target.value; const days = computeDays(leaveModal.start_date, end); setLeaveModal({...leaveModal, end_date:end, days});
                }}/>
              </div>
              <div>
                <label className="block text-sm">Gün</label>
                <input type="number" className="border p-2 w-full" value={leaveModal.days} onChange={e=> setLeaveModal({...leaveModal, days: Number(e.target.value)})}/>
              </div>
              <div>
                <label className="block text-sm">Tür</label>
                <select className="border p-2 w-full" value={leaveModal.leave_type} onChange={e=> setLeaveModal({...leaveModal, leave_type: e.target.value})}>
                  <option value="ANNUAL">Yıllık</option>
                  <option value="SICK">Rapor</option>
                  <option value="UNPAID">Ücretsiz</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm">Not</label>
                <input className="border p-2 w-full" value={leaveModal.note} onChange={e=> setLeaveModal({...leaveModal, note:e.target.value})}/>
              </div>
            </div>
            <div className="text-right space-x-2">
              <button className="px-4 py-2 bg-gray-300" onClick={()=> setLeaveModal(null)}>Vazgeç</button>
              <button className="px-4 py-2 bg-blue-600 text-white" onClick={async ()=>{
                try { if (!leaveModal) return; await createLeave(leaveModal); toast.success('İzin eklendi'); setLeaveModal(null); await load(); } catch (e:any) { toast.error(e?.response?.data?.detail || 'İzin eklenemedi'); }
              }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function computeDays(start?: string, end?: string) {
  if (!start || !end) return 0;
  try {
    const s = new Date(start);
    const e = new Date(end);
    const diff = (e.getTime() - s.getTime()) / (1000*60*60*24);
    return Math.max(0, Math.floor(diff) + 1);
  } catch { return 0; }
}

function SimpleLines({ data }: { data: Array<{ month: number; salary_total: number; insurance_total: number }> }) {
  const w = 600, h = 120, pad = 24;
  const max = Math.max(...data.map(d => Math.max(d.salary_total, d.insurance_total, 0)), 1);
  const x = (i: number) => pad + (i * (w - 2*pad)) / Math.max(1, data.length - 1);
  const y = (v: number) => h - pad - (v / max) * (h - 2*pad);
  const toPoints = (key: 'salary_total'|'insurance_total') => data.map((d,i)=>`${x(i)},${y(d[key])}`).join(' ');
  const months = ['O','Ş','M','N','M','H','T','A','E','E','K','A'];
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} height={h}>
      <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={toPoints('salary_total')} />
      <polyline fill="none" stroke="#10b981" strokeWidth="2" points={toPoints('insurance_total')} />
      {data.map((d,i)=> (
        <text key={i} x={x(i)} y={h-6} fontSize="10" textAnchor="middle" fill="#6b7280">{months[(d.month-1)%12]}</text>
      ))}
      <text x={pad} y={12} fontSize="10" fill="#3b82f6">Maaş</text>
      <text x={pad+40} y={12} fontSize="10" fill="#10b981">Sigorta</text>
    </svg>
  );
}
