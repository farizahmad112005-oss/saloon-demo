import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ContentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatPKR, formatTimeLabel, STATUS_COLORS, STATUS_LABELS } from '../../utils/format';
import { getGuestAppointments, setGuestAppointments } from '../../utils/guestAppointments';
import { Star } from 'lucide-react';

export default function Appointments() {
  const { isCustomer } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(null);
  const [review, setReview] = useState({ rating: 5, customer_name: '', comment: '' });

  const loadMine = async () => {
    setLoading(true);
    try {
      const { data } = await ContentAPI.myAppointments();
      setItems(data.data.items);
    } finally {
      setLoading(false);
    }
  };

  const loadGuest = async () => {
    setLoading(true);
    try {
      const local = getGuestAppointments();
      setItems(local);

      if (!local.length) return;

      // Refresh latest status from server for appointments saved in this browser
      const refreshed = await Promise.all(
        local.map(async (appt) => {
          try {
            const { data } = await ContentAPI.appointment(appt.id);
            return data.data;
          } catch {
            return appt;
          }
        })
      );
      refreshed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setItems(refreshed);
      setGuestAppointments(refreshed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCustomer) loadMine();
    else loadGuest();
  }, [isCustomer]);

  const lookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await ContentAPI.lookupAppointments(phone);
      const found = data.data || [];
      // Merge phone lookup with any local guest bookings
      const local = getGuestAppointments();
      const byId = new Map();
      [...found, ...local].forEach((a) => byId.set(a.id, a));
      const merged = [...byId.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setItems(merged);
      setGuestAppointments(merged);
      if (!merged.length) toast.info('No appointments found for this phone.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async (appt) => {
    try {
      const { data } = await ContentAPI.appointment(appt.id);
      setSelected(data.data);
      if (data.data.status === 'completed' && !data.data.review_id) {
        setReviewOpen(data.data);
        setReview((r) => ({ ...r, customer_name: data.data.client_name }));
      }
    } catch (err) {
      // Fall back to locally stored appointment if API fails
      setSelected(appt);
      toast.error(err.message);
    }
  };

  const submitReview = async () => {
    try {
      await ContentAPI.createReview({
        appointment_id: reviewOpen.id,
        rating: review.rating,
        customer_name: review.customer_name,
        comment: review.comment,
      });
      toast.success('Thank you for your feedback');
      setReviewOpen(null);
      if (isCustomer) loadMine();
      else loadGuest();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="page-shell max-w-5xl">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">Appointments</p>
      <h1 className="page-title">Your appointments</h1>

      {!isCustomer ? (
        <div className="mt-6 space-y-3 sm:mt-8">
          <p className="text-sm text-muted">
            Guest bookings from this browser are shown below automatically. You can also look up by phone.
          </p>
          <form onSubmit={lookup} className="flex flex-col gap-3 rounded-[24px] bg-blush p-4 sm:flex-row sm:rounded-[28px] sm:p-6">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone used for booking"
              className="w-full rounded-full border border-blush/50 bg-ivory px-5 py-3 outline-none"
            />
            <Button type="submit" className="w-full sm:w-auto">Find appointments</Button>
            <Button as={Link} to="/login" variant="secondary" className="w-full sm:w-auto">Login</Button>
          </form>
        </div>
      ) : null}

      {loading ? (
        <LoadingSpinner />
      ) : !items.length ? (
        <div className="mt-10">
          <EmptyState
            title="No appointments yet"
            description="Book a cut or fade to begin your Velour journey."
            action={<Button as={Link} to="/booking">Book Appointment</Button>}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {items.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => openDetails(a)}
              className="grid w-full gap-2 rounded-[20px] bg-blush p-4 text-left transition active:bg-blush/30 sm:rounded-[24px] sm:p-5 md:grid-cols-[1.2fr_1fr_1fr_auto]"
            >
              <div>
                <p className="text-xs text-muted">{a.appointment_code}</p>
                <p className="font-display text-2xl text-burgundy">{a.service_name || a.package_name}</p>
                {a.staff_name ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gold">{a.staff_name}</p>
                ) : null}
              </div>
              <div className="text-sm text-muted">
                <p>{a.appointment_date}</p>
                <p>{formatTimeLabel(a.appointment_time)}</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">{formatPKR(a.final_price)}</p>
                <p className="text-muted">Booked {a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</p>
              </div>
              <span className={`h-fit rounded-full px-3 py-1 text-xs ${STATUS_COLORS[a.status] || STATUS_COLORS.pending}`}>
                {STATUS_LABELS[a.status] || a.status}
              </span>
            </button>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Appointment details" wide>
        {selected ? (
          <div className="space-y-3 text-sm">
            <p><strong>ID:</strong> {selected.appointment_code}</p>
            <p><strong>Service:</strong> {selected.service_name || selected.package_name}</p>
            {selected.staff_name ? <p><strong>Barber:</strong> {selected.staff_name}</p> : null}
            <p><strong>Date:</strong> {selected.appointment_date} · {formatTimeLabel(selected.appointment_time)}</p>
            <p><strong>Client:</strong> {selected.client_name} ({selected.client_phone})</p>
            <p><strong>Price:</strong> {formatPKR(selected.final_price)}</p>
            <p><strong>Status:</strong> {STATUS_LABELS[selected.status] || selected.status}</p>
            {selected.rating ? (
              <p><strong>Your review:</strong> {'★'.repeat(selected.rating)} — {selected.review_comment}</p>
            ) : null}
            {selected.status === 'completed' && !selected.review_id ? (
              <Button className="mt-4" onClick={() => { setReviewOpen(selected); setSelected(null); }}>Leave feedback</Button>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal open={!!reviewOpen} onClose={() => setReviewOpen(null)} title="How was your experience?">
        <div className="space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setReview({ ...review, rating: n })} className="text-gold">
                <Star size={28} fill={n <= review.rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          <input
            className="w-full rounded-2xl border border-blush/50 bg-ivory px-4 py-3"
            placeholder="Your name"
            value={review.customer_name}
            onChange={(e) => setReview({ ...review, customer_name: e.target.value })}
          />
          <textarea
            className="min-h-28 w-full rounded-2xl border border-blush/50 bg-ivory px-4 py-3"
            placeholder="Share your experience (optional)"
            value={review.comment}
            onChange={(e) => setReview({ ...review, comment: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setReviewOpen(null)}>Skip</Button>
            <Button onClick={submitReview}>Submit review</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
