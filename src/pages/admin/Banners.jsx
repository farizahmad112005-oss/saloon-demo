import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { AdminAPI, ContentAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { mediaUrl } from '../../utils/format';

const empty = { title: '', subtitle: '', image: '', cta_text: '', cta_url: '/booking', is_active: true, sort_order: 0 };

export default function AdminBanners() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await ContentAPI.banners();
      setItems(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing) await AdminAPI.updateBanner(editing, form);
      else await AdminAPI.createBanner(form);
      toast.success('Banner saved');
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const remove = async () => {
    try {
      await AdminAPI.deleteBanner(delId);
      toast.success('Banner deleted');
      setDelId(null);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-4xl text-burgundy">Banners</h2>
        <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}>Add banner</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((b) => (
          <article key={b.id} className="overflow-hidden rounded-[24px] bg-blush">
            <img src={mediaUrl(b.image)} alt={b.title} className="h-40 w-full object-cover" />
            <div className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{b.title}</p>
                <p className="text-sm text-muted">{b.is_active ? 'Active' : 'Inactive'} · order {b.sort_order}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => { setEditing(b.id); setForm({ title: b.title, subtitle: b.subtitle || '', image: b.image, cta_text: b.cta_text || '', cta_url: b.cta_url || '', is_active: !!b.is_active, sort_order: b.sort_order }); setOpen(true); }}>Edit</Button>
                <Button variant="ghost" onClick={() => setDelId(b.id)}>Delete</Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit banner' : 'New banner'}>
        <div className="space-y-3">
          <input className="w-full rounded-2xl border border-blush/40 px-4 py-3" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="w-full rounded-2xl border border-blush/40 px-4 py-3" placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <ImageUploadField
            label="Banner photo"
            folder="banners"
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            required
          />
          <input className="w-full rounded-2xl border border-blush/40 px-4 py-3" placeholder="CTA text" value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} />
          <input className="w-full rounded-2xl border border-blush/40 px-4 py-3" placeholder="CTA URL" value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} />
          <input type="number" className="w-full rounded-2xl border border-blush/40 px-4 py-3" placeholder="Sort order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
          <Button onClick={save} disabled={!form.image}>Save banner</Button>
        </div>
      </Modal>
      <ConfirmDialog
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={remove}
        title="Delete banner?"
        message="This banner will be permanently removed from the homepage slider."
      />
    </div>
  );
}
