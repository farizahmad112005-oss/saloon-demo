import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { AdminAPI, ContentAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { formatPKR } from '../../utils/format';

const empty = { name: '', description: '', package_price: '', image: '', is_active: true, service_ids: [] };

export default function AdminPackages() {
  const [items, setItems] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([ContentAPI.packages(), ContentAPI.services()]);
      setItems(p.data.data);
      setServices(s.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleService = (id) => {
    setForm((f) => ({
      ...f,
      service_ids: f.service_ids.includes(id)
        ? f.service_ids.filter((x) => x !== id)
        : [...f.service_ids, id],
    }));
  };

  const original = services
    .filter((s) => form.service_ids.includes(s.id))
    .reduce((sum, s) => sum + Number(s.price), 0);

  const save = async () => {
    try {
      const payload = { ...form, package_price: Number(form.package_price) };
      if (editing) await AdminAPI.updatePackage(editing, payload);
      else await AdminAPI.createPackage(payload);
      toast.success('Package saved');
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
        <h2 className="font-display text-4xl text-burgundy">Packages</h2>
        <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}>Add package</Button>
      </div>
      <div className="grid gap-4">
        {items.map((p) => (
          <article key={p.id} className="rounded-[24px] bg-blush p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-3xl text-burgundy">{p.name}</h3>
                <p className="text-sm text-muted">{p.description}</p>
                <p className="mt-2 text-sm">{formatPKR(p.package_price)} <span className="text-muted line-through">{formatPKR(p.original_price)}</span></p>
              </div>
              <Button variant="secondary" onClick={() => {
                setEditing(p.id);
                setForm({
                  name: p.name,
                  description: p.description || '',
                  package_price: p.package_price,
                  image: p.image || '',
                  is_active: !!p.is_active,
                  service_ids: (p.services || []).map((s) => s.id),
                });
                setOpen(true);
              }}>Edit</Button>
            </div>
          </article>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit package' : 'New package'} wide>
        <div className="space-y-3">
          <input className="w-full rounded-2xl border border-blush/40 px-4 py-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea className="w-full rounded-2xl border border-blush/40 px-4 py-3" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input type="number" className="w-full rounded-2xl border border-blush/40 px-4 py-3" placeholder="Package price" value={form.package_price} onChange={(e) => setForm({ ...form, package_price: e.target.value })} />
          <ImageUploadField
            label="Package photo"
            folder="packages"
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
          />
          <p className="text-sm text-muted">Combined original: {formatPKR(original)} · Savings: {formatPKR(Math.max(0, original - Number(form.package_price || 0)))}</p>
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-2xl border border-blush/30 p-3">
            {services.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.service_ids.includes(s.id)} onChange={() => toggleService(s.id)} />
                {s.name} ({formatPKR(s.price)})
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
          <Button onClick={save}>Save package</Button>
        </div>
      </Modal>
    </div>
  );
}
