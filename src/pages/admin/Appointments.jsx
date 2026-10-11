import { useEffect, useRef, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { AdminAPI, ContentAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { formatPKR, formatTimeLabel, STATUS_COLORS, STATUS_LABELS } from '../../utils/format';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

export default function AdminAppointments() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [services, setServices] = useState([]);
  const [filters, setFilters] = useState({
    preset: '', status: '', service_id: '', q: '', date: '', from_date: '', to_date: '', page: 1,
  });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusBusy, setStatusBusy] = useState(null);
  const selectedIdRef = useRef(null);
  const socket = useSocket();
  const toast = useToast();

  selectedIdRef.current = selected?.id ?? null;

  const load = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await AdminAPI.appointments(params);
      setData(res.data.data);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    ContentAPI.services().then((r) => setServices(r.data.data));
  }, []);

  useEffect(() => { load(); }, [filters]);

  useEffect(() => {
    if (!socket) return undefined;
    const refresh = (appt) => {
      if (appt?.id && Number(appt.id) === Number(selectedIdRef.current)) {
        setSelected((prev) => (prev ? { ...prev, ...appt, status: appt.status } : appt));
      }
      setData((prev) => ({
        ...prev,
        items: (prev.items || []).map((row) =>
          Number(row.id) === Number(appt?.id) ? { ...row, ...appt, status: appt.status } : row
        ),
      }));
      if (!selectedIdRef.current || Number(appt?.id) !== Number(selectedIdRef.current)) {
        toast.info(`Appointment update: ${appt.appointment_code || appt.client_name}`);
      }
      load({ silent: true });
    };
    socket.on('appointment:created', refresh);
    socket.on('appointment:statusChanged', refresh);
    return () => {
      socket.off('appointment:created', refresh);
      socket.off('appointment:statusChanged', refresh);
    };
  }, [socket, toast]);

  const open = async (id) => {
    const { data: res } = await ContentAPI.appointment(id);
    setSelected(res.data);
  };

  const changeStatus = async (status) => {
    if (!selected || selected.status === status || statusBusy) return;

    const previous = selected;
    // Optimistic: highlight the new status immediately
    setStatusBusy(status);
    setSelected((prev) => (prev ? { ...prev, status } : prev));
    setData((prev) => ({
      ...prev,
      items: (prev.items || []).map((row) =>
        Number(row.id) === Number(previous.id) ? { ...row, status } : row
      ),
    }));

    try {
      const { data: res } = await AdminAPI.updateStatus(previous.id, status);
      const updated = res.data;
      setSelected((prev) => (prev && Number(prev.id) === Number(updated.id) ? { ...prev, ...updated } : prev));
      setData((prev) => ({
        ...prev,
        items: (prev.items || []).map((row) =>
          Number(row.id) === Number(updated.id) ? { ...row, ...updated } : row
        ),
      }));
      toast.success('Status updated');
    } catch (e) {
      setSelected(previous);
      setData((prev) => ({
        ...prev,
        items: (prev.items || []).map((row) =>
          Number(row.id) === Number(previous.id) ? { ...row, status: previous.status } : row
        ),
      }));
      toast.error(e.message);
    } finally {
      setStatusBusy(null);
    }
  };

  const clearFilters = () => setFilters({
    preset: '', status: '', service_id: '', q: '', date: '', from_date: '', to_date: '', page: 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-gold">Appointments</p>
        <h2 className="font-display text-4xl text-burgundy">Live booking desk</h2>
      </div>

      <div className="grid gap-3 rounded-[24px] bg-blush p-4 md:grid-cols-4">
        <select className="rounded-2xl border border-blush/40 bg-ivory px-3 py-2 text-sm" value={filters.preset} onChange={(e) => setFilters({ ...filters, preset: e.target.value, date: '', page: 1 })}>
          <option value="">Date preset</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="tomorrow">Tomorrow</option>
        </select>
        <input type="date" className="rounded-2xl border border-blush/40 bg-ivory px-3 py-2 text-sm" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value, preset: '', page: 1 })} />
        <input type="date" className="rounded-2xl border border-blush/40 bg-ivory px-3 py-2 text-sm" value={filters.from_date} onChange={(e) => setFilters({ ...filters, from_date: e.target.value, page: 1 })} placeholder="From" />
        <input type="date" className="rounded-2xl border border-blush/40 bg-ivory px-3 py-2 text-sm" value={filters.to_date} onChange={(e) => setFilters({ ...filters, to_date: e.target.value, page: 1 })} />
        <select className="rounded-2xl border border-blush/40 bg-ivory px-3 py-2 text-sm" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select className="rounded-2xl border border-blush/40 bg-ivory px-3 py-2 text-sm" value={filters.service_id} onChange={(e) => setFilters({ ...filters, service_id: e.target.value, page: 1 })}>
          <option value="">All services</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input className="rounded-2xl border border-blush/40 bg-ivory px-3 py-2 text-sm md:col-span-2" placeholder="Search customer, phone, code…" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })} />
        <Button variant="secondary" onClick={clearFilters}>Clear filters</Button>
      </div>

      {loading ? <LoadingSpinner /> : !data.items.length ? <EmptyState title="No appointments found" /> : (
        <div className="overflow-x-auto rounded-[24px] bg-blush">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-blush/40 text-muted">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Barber</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((a) => (
                <tr key={a.id} className="cursor-pointer border-b border-blush/20 hover:bg-blush/20" onClick={() => open(a.id)}>
                  <td className="px-4 py-3 font-medium">{a.appointment_code}</td>
                  <td className="px-4 py-3">{a.client_name}<div className="text-xs text-muted">{a.client_phone}</div></td>
                  <td className="px-4 py-3">{a.service_name || a.package_name}</td>
                  <td className="px-4 py-3">{a.staff_name || '—'}</td>
                  <td className="px-4 py-3">{a.appointment_date}</td>
                  <td className="px-4 py-3">{formatTimeLabel(a.appointment_time)}</td>
                  <td className="px-4 py-3">{formatPKR(a.final_price)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${STATUS_COLORS[a.status]}`}>{STATUS_LABELS[a.status]}</span></td>
                  <td className="px-4 py-3">{new Date(a.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Appointment details" wide>
        {selected ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <h4 className="font-display text-2xl text-burgundy">Customer</h4>
              <p>Name: {selected.client_name}</p>
              <p>Age: {selected.client_age || '—'}</p>
              <p>Phone: {selected.client_phone}</p>
            </div>
            <div className="space-y-2 text-sm">
              <h4 className="font-display text-2xl text-burgundy">Appointment</h4>
              <p>ID: {selected.appointment_code}</p>
              <p>Service: {selected.service_name || selected.package_name}</p>
              <p>Barber: {selected.staff_name || '—'}</p>
              <p>Category: {selected.category_name || '—'}</p>
              <p>Date: {selected.appointment_date}</p>
              <p>Time: {formatTimeLabel(selected.appointment_time)}</p>
              <p>Original: {formatPKR(selected.original_price)}</p>
              <p>Discount: {formatPKR(selected.discount_amount)} {selected.discount_code ? `(${selected.discount_code})` : ''}</p>
              <p>Final: {formatPKR(selected.final_price)}</p>
              <p>Booked: {new Date(selected.created_at).toLocaleString()}</p>
              <p className="pt-1">
                Status:{' '}
                <span className={`rounded-full px-2 py-1 text-xs ${STATUS_COLORS[selected.status]}`}>
                  {STATUS_LABELS[selected.status]}
                </span>
              </p>
            </div>
            {selected.rating ? (
              <div className="md:col-span-2 rounded-2xl bg-blush/30 p-4 text-sm">
                <p className="font-medium">Feedback</p>
                <p>{'★'.repeat(selected.rating)} — {selected.review_customer_name}</p>
                <p className="text-muted">{selected.review_comment}</p>
              </div>
            ) : null}
            <div className="md:col-span-2">
              <p className="mb-2 text-sm text-muted">Update status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => {
                  const active = selected.status === s;
                  return (
                    <Button
                      key={s}
                      type="button"
                      variant={active ? 'gold' : 'secondary'}
                      disabled={!!statusBusy}
                      aria-pressed={active}
                      className={active ? 'ring-2 ring-gold ring-offset-2 ring-offset-ivory' : ''}
                      onClick={() => changeStatus(s)}
                    >
                      {statusBusy === s ? 'Saving…' : STATUS_LABELS[s]}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
