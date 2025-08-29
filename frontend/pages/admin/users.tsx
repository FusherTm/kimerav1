import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { listOrgUsers, listRoles, assignUserRole, createOrgUser } from '../../lib/api/admin';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [rows, setRows] = useState<Array<{ user_id: string; email: string; role: string }>>([]);
  const [roles, setRoles] = useState<Array<{ name: string }>>([]);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: '' });

  const load = async () => {
    const [u, r] = await Promise.all([listOrgUsers(), listRoles()]);
    setRows(u);
    setRoles(r.map((x:any)=>({name:x.name})));
  };
  useEffect(() => { load(); }, []);

  const save = async (user_id: string, role: string) => {
    await assignUserRole(user_id, role);
    toast.success('Rol atandı');
    await load();
  };

  const create = async () => {
    if (!newUser.email || !newUser.password) return;
    await createOrgUser({ email: newUser.email, password: newUser.password, role: newUser.role || (roles[0]?.name || 'viewer') });
    toast.success('Kullanıcı oluşturuldu');
    setNewUser({ email: '', password: '', role: '' });
    await load();
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Kullanıcı Rolleri</h1>
      <div className="bg-white p-3 rounded shadow mb-4">
        <div className="font-semibold mb-2">Yeni Kullanıcı</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="border p-2" placeholder="E-posta" value={newUser.email} onChange={e=>setNewUser({ ...newUser, email: e.target.value })} />
          <input className="border p-2" placeholder="Şifre" type="password" value={newUser.password} onChange={e=>setNewUser({ ...newUser, password: e.target.value })} />
          <select className="border p-2" value={newUser.role} onChange={e=>setNewUser({ ...newUser, role: e.target.value })}>
            <option value="">Rol seçin</option>
            {roles.map(ro => (<option key={ro.name} value={ro.name}>{ro.name}</option>))}
          </select>
          <button className="bg-blue-600 text-white px-4" onClick={create}>Oluştur</button>
        </div>
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="border p-2 text-left">E-posta</th>
            <th className="border p-2 text-left">Rol</th>
            <th className="border p-2">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.user_id}>
              <td className="border p-2">{r.email}</td>
              <td className="border p-2">
                <select defaultValue={r.role} className="border p-1" id={`sel-${r.user_id}`}>
                  {roles.map(ro => (
                    <option key={ro.name} value={ro.name}>{ro.name}</option>
                  ))}
                </select>
              </td>
              <td className="border p-2 text-center">
                <button className="px-3 py-1 bg-blue-600 text-white" onClick={() => {
                  const sel = (document.getElementById(`sel-${r.user_id}`) as HTMLSelectElement);
                  save(r.user_id, sel.value);
                }}>Kaydet</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
