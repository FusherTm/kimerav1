import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { getActiveJobs, updateJobStatus, ProductionJob } from '../../lib/api/production';

const statuses = [
  { key: 'BEKLIYOR', label: 'Kesim Bekliyor' },
  { key: 'PRESTE', label: 'Preste' },
  { key: 'HAZIR', label: 'Hazır' },
];

export default function ProductionPanel() {
  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const token = '';
  const org = '';

  useEffect(() => {
    const load = async () => {
      const data = await getActiveJobs(token, org);
      setJobs(data);
    };
    load();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    const updated = await updateJobStatus(token, org, id, status);
    setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Üretim Paneli</h1>
      <div className="flex space-x-4 overflow-x-auto">
        {statuses.map((col) => (
          <div key={col.key} className="flex-1 min-w-[250px] bg-gray-100 p-2 rounded">
            <h2 className="text-center font-semibold mb-2">{col.label}</h2>
            {jobs.filter((j) => j.status === col.key).map((job) => (
              <div key={job.id} className="bg-white p-2 rounded shadow mb-2">
                <div className="font-semibold">{job.order_number}</div>
                <div className="text-sm">{job.partner_name}</div>
                <div className="text-sm">{job.product_name}</div>
                <div className="text-sm">
                  {job.width}x{job.height}
                </div>
                <div className="text-sm">Adet: {job.quantity}</div>
                <select
                  value={job.status}
                  onChange={(e) => handleStatusChange(job.id, e.target.value)}
                  className="mt-2 border p-1 text-sm w-full"
                >
                  {statuses.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Layout>
  );
}
