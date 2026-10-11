import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { AdminAPI, ContentAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await ContentAPI.reviews();
      setItems(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id, patch) => {
    try {
      await AdminAPI.updateReview(id, patch);
      toast.success('Review updated');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-4xl text-burgundy">Feedback</h2>
      <div className="space-y-3">
        {items.map((r) => (
          <article key={r.id} className="rounded-[24px] bg-blush p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{r.customer_name} · {'★'.repeat(r.rating)}</p>
                <p className="text-sm text-muted">{r.service_name}</p>
                <p className="mt-2 text-sm">{r.comment}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => toggle(r.id, { is_visible: !r.is_visible })}>
                  {r.is_visible ? 'Hide' : 'Show'}
                </Button>
                <Button variant="ghost" onClick={() => toggle(r.id, { is_featured: !r.is_featured })}>
                  {r.is_featured ? 'Unfeature' : 'Feature'}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
