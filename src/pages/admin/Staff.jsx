import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { AdminAPI, ContentAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { mediaUrl } from '../../utils/format';

const DAYS = [
  { v: 0, l: 'Sun' }, { v: 1, l: 'Mon' }, { v: 2, l: 'Tue' }, { v: 3, l: 'Wed' },
  { v: 4, l: 'Thu' }, { v: 5, l: 'Fri' }, { v: 6, l: 'Sat' },
];

const empty = {
  name: '',
  title: 'Barber',
  role: 'barber',
  bio: '',
  photo: '',
  phone: '',
  email: '',
  is_active: true,
  sort_order: 0,
  available_days: [1, 2, 3, 4, 5, 6],
  service_ids: [],
};

export default function AdminStaff() {
  const [items, setItems] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [st, sv] = await Promise.all([AdminAPI.staff(), ContentAPI.services()]);
      setItems(st.data.data);
      setServices(sv.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      available_days: f.available_days.includes(day)
        ? f.available_days.filter((d) => d !== day)
        : [...f.available_days, day].sort(),
    }));
  };

  const toggleService = (id) => {
    setForm((f) => ({
      ...f,
      service_ids: f.service_ids.includes(id)
        ? f.service_ids.filter((x) => x !== id)
        : [...f.service_ids, id],
    }));
  };

  const save = async () => {
    try {
      const payload = {
        ...form,
        sort_order: Number(form.sort_order) || 0,
        service_ids: form.service_ids,
      };
      if (editing) await AdminAPI.updateStaff(editing, payload);
      else await AdminAPI.createStaff(payload);
      toast.success('Staff saved');
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const remove = async () => {
    try {
      const { data } = await AdminAPI.deleteStaff(delId);
      toast.success(data.message || 'Staff deleted');
      setDelId(null);
      await load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gold">Team</p>
          <h2 className="font-display text-4xl text-burgundy">Staff & barbers</h2>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setForm(empty);
            setOpen(true);
          }}
        >
          Add staff
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((s) => (
          <article
            key={s.id}
            className="overflow-hidden rounded-[24px] border border-white/8 bg-blush"
          >
            <div className="relative aspect-[4/3] bg-nude">
              {s.photo ? (
                <img src={mediaUrl(s.photo)} alt={s.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted">No photo</div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                <p className="font-display text-2xl text-burgundy">{s.name}</p>
                <p className="text-xs uppercase tracking-[0.22em] text-gold">{s.title}</p>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <p className="line-clamp-2 text-sm text-muted">{s.bio || 'No bio yet.'}</p>
              <p className="text-xs text-champagne">
                {s.role} · {s.is_active ? 'Active' : 'Inactive'} ·{' '}
                {s.can_do_all_services ? 'All services' : `${s.services?.length || 0} services`}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setEditing(s.id);
                    setForm({
                      name: s.name,
                      title: s.title || 'Barber',
                      role: s.role || 'barber',
                      bio: s.bio || '',
                      photo: s.photo || '',
                      phone: s.phone || '',
                      email: s.email || '',
                      is_active: !!s.is_active,
                      sort_order: s.sort_order || 0,
                      available_days: s.available_days || [],
                      service_ids: (s.services || []).map((x) => x.id),
                    });
                    setOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button variant="ghost" onClick={() => setDelId(s.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit staff' : 'New staff'} wide>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy"
            placeholder="Title (e.g. Senior Barber)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <select
            className="rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="barber">Barber (bookable)</option>
            <option value="other">Other staff</option>
          </select>
          <input
            type="number"
            className="rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy"
            placeholder="Sort order"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
          />
          <input
            className="rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            className="rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <textarea
            className="rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy md:col-span-2"
            placeholder="Bio"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <ImageUploadField
            label="Staff photo"
            folder="staff"
            value={form.photo}
            onChange={(url) => setForm((f) => ({ ...f, photo: url }))}
          />
          <div className="md:col-span-2">
            <p className="mb-2 text-sm text-muted">Working days</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <button
                  key={d.v}
                  type="button"
                  onClick={() => toggleDay(d.v)}
                  className={`rounded-full px-3 py-1 text-sm ${
                    form.available_days.includes(d.v) ? 'bg-gold text-black' : 'bg-nude text-champagne'
                  }`}
                >
                  {d.l}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="mb-2 text-sm text-muted">
              Services this barber can do (leave empty = all services)
            </p>
            <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => toggleService(svc.id)}
                  className={`rounded-full px-3 py-1 text-xs ${
                    form.service_ids.includes(svc.id) ? 'bg-gold text-black' : 'bg-nude text-champagne'
                  }`}
                >
                  {svc.name}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-burgundy md:col-span-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Active
          </label>
          <Button onClick={save}>Save staff</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={remove}
        title="Delete staff?"
        message="If they have upcoming appointments they will be deactivated instead."
      />
    </div>
  );
}
