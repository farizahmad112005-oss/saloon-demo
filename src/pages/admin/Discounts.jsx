import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { AdminAPI, ContentAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const empty = {
  code: '', title: '', description: '', discount_type: 'percentage', discount_value: '',
  start_date: '', end_date: '', category_id: '', usage_limit: '', is_active: true, service_ids: [],
};

export default function AdminDiscounts() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [d, c, s] = await Promise.all([AdminAPI.discounts(), ContentAPI.categories(), ContentAPI.services()]);
      setItems(d.data.data);
      setCategories(c.data.data);
      setServices(s.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const categoryServices = useMemo(() => {
    if (!form.category_id) return services;
    return services.filter((s) => String(s.category_id) === String(form.category_id));
  }, [services, form.category_id]);

  const save = async () => {
    try {
      const payload = {
        ...form,
        discount_value: Number(form.discount_value),
        category_id: form.category_id || null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      };
      if (editing) await AdminAPI.updateDiscount(editing, payload);
      else await AdminAPI.createDiscount(payload);
      toast.success('Discount saved');
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-4xl text-burgundy">Discounts</h2>
        <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}>Add discount</Button>
      </div>
      <div className="grid gap-3">
        {items.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-blush p-4">
            <div>
              <p className="font-medium">{d.code} · {d.title}</p>
              <p className="text-sm text-muted">
                {d.discount_type === 'percentage' ? `${d.discount_value}%` : `Rs. ${d.discount_value}`} · {d.start_date} → {d.end_date}
              </p>
            </div>
            <Button variant="secondary" onClick={() => {
              setEditing(d.id);
              setForm({
                code: d.code,
                title: d.title || '',
                description: d.description || '',
                discount_type: d.discount_type,
                discount_value: d.discount_value,
                start_date: d.start_date,
                end_date: d.end_date,
                category_id: d.category_id || '',
                usage_limit: d.usage_limit || '',
                is_active: !!d.is_active,
                service_ids: (d.services || []).map((s) => s.id),
              });
              setOpen(true);
            }}>Edit</Button>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit discount' : 'New discount'} wide>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-2xl border border-blush/40 px-4 py-3" placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <input className="rounded-2xl border border-blush/40 px-4 py-3" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="rounded-2xl border border-blush/40 px-4 py-3" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          <input type="number" className="rounded-2xl border border-blush/40 px-4 py-3" placeholder="Value" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
          <input type="date" className="rounded-2xl border border-blush/40 px-4 py-3" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <input type="date" className="rounded-2xl border border-blush/40 px-4 py-3" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          <select className="rounded-2xl border border-blush/40 px-4 py-3 md:col-span-2" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value, service_ids: [] })}>
            <option value="">All / no category filter</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-2xl border border-blush/30 p-3 md:col-span-2">
            <p className="text-sm text-muted">Select applicable services</p>
            {categoryServices.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.service_ids.includes(s.id)}
                  onChange={() => setForm((f) => ({
                    ...f,
                    service_ids: f.service_ids.includes(s.id)
                      ? f.service_ids.filter((x) => x !== s.id)
                      : [...f.service_ids, s.id],
                  }))}
                />
                {s.name}
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active
          </label>
          <Button onClick={save}>Save discount</Button>
        </div>
      </Modal>
    </div>
  );
}
