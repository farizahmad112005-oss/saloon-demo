import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { AuthAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminProfile() {
  const [form, setForm] = useState(null);
  const toast = useToast();

  useEffect(() => {
    AuthAPI.adminProfile().then((r) => setForm({ ...r.data.data, currentPassword: '', newPassword: '' }));
  }, []);

  if (!form) return <LoadingSpinner />;

  const save = async () => {
    try {
      await AuthAPI.updateAdminProfile({
        name: form.name,
        phone: form.phone,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined,
      });
      toast.success('Profile updated');
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '' }));
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="font-display text-4xl text-burgundy">Admin profile</h2>
      <div className="space-y-3 rounded-[24px] bg-blush p-6">
        <input className="w-full rounded-2xl border border-blush/40 px-4 py-3" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full rounded-2xl border border-blush/40 px-4 py-3" value={form.email || ''} disabled />
        <input className="w-full rounded-2xl border border-blush/40 px-4 py-3" placeholder="Phone" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input type="password" className="w-full rounded-2xl border border-blush/40 px-4 py-3" placeholder="Current password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
        <input type="password" className="w-full rounded-2xl border border-blush/40 px-4 py-3" placeholder="New password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
        <Button onClick={save}>Save profile</Button>
      </div>
    </div>
  );
}
