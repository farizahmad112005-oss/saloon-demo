import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { AdminAPI } from '../../services/api';
import { formatPKR } from '../../utils/format';

export default function AdminCustomers() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    AdminAPI.customers({ q, limit: 50 })
      .then((r) => setData(r.data.data))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-4xl text-burgundy">Customers</h2>
      <input
        className="w-full max-w-md rounded-2xl border border-blush/40 bg-nude px-4 py-3"
        placeholder="Search name, phone, email…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {loading ? <LoadingSpinner /> : !data.items.length ? <EmptyState title="No customers found" /> : (
        <div className="overflow-x-auto rounded-[24px] bg-blush">
          <table className="min-w-full text-sm">
            <thead className="border-b border-blush/40 text-muted">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Appointments</th>
                <th className="px-4 py-3 text-left">Lifetime value</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((c) => (
                <tr key={c.id} className="border-b border-blush/20">
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3">{c.email || '—'}</td>
                  <td className="px-4 py-3">{c.appointment_count}</td>
                  <td className="px-4 py-3">{formatPKR(c.lifetime_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
