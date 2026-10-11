import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { AdminAPI, ContentAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const empty = { name: '', description: '', is_active: true, sort_order: 0, image: '' };

export default function AdminCategories() {
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
      const { data } = await ContentAPI.categories();
      setItems(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing) await AdminAPI.updateCategory(editing, form);
      else await AdminAPI.createCategory(form);
      toast.success('Category saved');
      setOpen(false);
      setEditing(null);
      setForm(empty);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const remove = async () => {
    try {
      await AdminAPI.deleteCategory(delId);
      toast.success('Category deleted');
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
        <h2 className="font-display text-4xl text-burgundy">Categories</h2>
        <Button onClick={() => { setForm(empty); setEditing(null); setOpen(true); }}>Add category</Button>
      </div>
      <div className="grid gap-3">
        {items.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-blush p-4">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-muted">{c.service_count} services · {c.is_active ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setEditing(c.id); setForm({ name: c.name, description: c.description || '', is_active: !!c.is_active, sort_order: c.sort_order, image: c.image || '' }); setOpen(true); }}>Edit</Button>
              <Button variant="ghost" onClick={() => setDelId(c.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit category' : 'New category'}>
        <div className="space-y-3">
          <input className="w-full rounded-2xl border border-blush/40 px-4 py-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea className="w-full rounded-2xl border border-blush/40 px-4 py-3" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
          <Button onClick={save}>Save</Button>
        </div>
      </Modal>
      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={remove} title="Delete category?" message="This is only allowed if no services depend on it." />
    </div>
  );
}
