import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { AdminAPI, ContentAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { formatPKR } from '../../utils/format';

const DAYS = [
  { v: 0, l: 'Sun' }, { v: 1, l: 'Mon' }, { v: 2, l: 'Tue' }, { v: 3, l: 'Wed' },
  { v: 4, l: 'Thu' }, { v: 5, l: 'Fri' }, { v: 6, l: 'Sat' },
];

const empty = {
  name: '', category_id: '', description: '', price: '', duration_minutes: 40,
  image: '', is_active: true, available_days: [1, 2, 3, 4, 5, 6],
};

export default function AdminServices() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([ContentAPI.services(), ContentAPI.categories()]);
      setItems(s.data.data);
      setCategories(c.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      available_days: f.available_days.includes(day)
        ? f.available_days.filter((d) => d !== day)
        : [...f.available_days, day].sort(),
    }));
  };

  const save = async () => {
    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        price: Number(form.price),
        duration_minutes: Number(form.duration_minutes),
      };
      if (editing) await AdminAPI.updateService(editing, payload);
      else await AdminAPI.createService(payload);
      toast.success('Service saved');
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const remove = async () => {
    try {
      const { data } = await AdminAPI.deleteService(delId);
      toast.success(data.message || 'Service deleted');
      setDelId(null);
      await load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-4xl text-burgundy">Services</h2>
        <Button onClick={() => { setEditing(null); setForm({ ...empty, category_id: categories[0]?.id || '' }); setOpen(true); }}>Add service</Button>
      </div>
      <div className="overflow-x-auto rounded-[24px] bg-blush">
        <table className="min-w-full text-sm">
          <thead className="border-b border-blush/40 text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Duration</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-b border-blush/20">
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">{s.category_name}</td>
                <td className="px-4 py-3">{formatPKR(s.price)}</td>
                <td className="px-4 py-3">{s.duration_minutes} min</td>
                <td className="px-4 py-3">{s.is_active ? 'Active' : 'Inactive'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => {
                      setEditing(s.id);
                      setForm({
                        name: s.name,
                        category_id: s.category_id,
                        description: s.description || '',
                        price: s.price,
                        duration_minutes: s.duration_minutes,
                        image: s.image || '',
                        is_active: !!s.is_active,
                        available_days: s.available_days || [],
                      });
                      setOpen(true);
                    }}>Edit</Button>
                    <Button variant="ghost" onClick={() => setDelId(s.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit service' : 'New service'} wide>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-2xl border border-blush/40 px-4 py-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="rounded-2xl border border-blush/40 px-4 py-3" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="number" className="rounded-2xl border border-blush/40 px-4 py-3" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input type="number" className="rounded-2xl border border-blush/40 px-4 py-3" placeholder="Duration minutes" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
          <textarea className="rounded-2xl border border-blush/40 px-4 py-3 md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <ImageUploadField
            label="Service photo"
            folder="services"
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
          />
          <div className="md:col-span-2">
            <p className="mb-2 text-sm text-muted">Available days</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <button key={d.v} type="button" onClick={() => toggleDay(d.v)} className={`rounded-full px-3 py-1 text-sm ${form.available_days.includes(d.v) ? 'bg-burgundy text-ivory' : 'bg-blush/40'}`}>
                  {d.l}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active
          </label>
          <Button onClick={save}>Save service</Button>
        </div>
      </Modal>
      <ConfirmDialog
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={remove}
        title="Delete service?"
        message="This permanently removes the service. It will also be removed from any packages and discount links. Past appointments keep their history."
      />    </div>
  );
}
