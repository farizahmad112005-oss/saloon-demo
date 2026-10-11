import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { AdminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const toast = useToast();

  useEffect(() => {
    AdminAPI.settings().then((r) => {
      const s = r.data.data;
      setForm({
        ...s,
        opening_time: String(s.opening_time).slice(0, 5),
        closing_time: String(s.closing_time).slice(0, 5),
        social_links: s.social_links || {},
      });
    });
  }, []);

  if (!form) return <LoadingSpinner />;

  const save = async () => {
    try {
      await AdminAPI.updateSettings({
        ...form,
        opening_time: `${form.opening_time}:00`.slice(0, 8),
        closing_time: `${form.closing_time}:00`.slice(0, 8),
        slot_interval_minutes: Number(form.slot_interval_minutes),
        booking_horizon_days: Number(form.booking_horizon_days),
      });
      toast.success('Settings updated');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="font-display text-4xl text-burgundy">Salon settings</h2>
      <div className="grid gap-3 rounded-[24px] bg-blush p-6 md:grid-cols-2">
        {[
          ['salon_name', 'Salon name'],
          ['phone', 'Phone'],
          ['email', 'Email'],
          ['currency', 'Currency'],
          ['timezone', 'Timezone'],
          ['opening_time', 'Opening time', 'time'],
          ['closing_time', 'Closing time', 'time'],
          ['slot_interval_minutes', 'Slot interval (minutes)', 'number'],
          ['booking_horizon_days', 'Booking horizon (days)', 'number'],
        ].map(([key, label, type = 'text']) => (
          <label key={key} className="text-sm">
            {label}
            <input
              type={type}
              className="mt-1 w-full rounded-2xl border border-blush/40 px-4 py-3"
              value={form[key] ?? ''}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
        <label className="text-sm md:col-span-2">
          Address
          <textarea className="mt-1 w-full rounded-2xl border border-blush/40 px-4 py-3" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>
        <label className="text-sm md:col-span-2">
          About text
          <textarea className="mt-1 min-h-28 w-full rounded-2xl border border-blush/40 px-4 py-3" value={form.about_text || ''} onChange={(e) => setForm({ ...form, about_text: e.target.value })} />
        </label>
        <Button onClick={save}>Save settings</Button>
      </div>
    </div>
  );
}
