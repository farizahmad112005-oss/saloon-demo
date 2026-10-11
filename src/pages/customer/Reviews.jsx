import { useEffect, useState } from 'react';
import ReviewCard from '../../components/customer/ReviewCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { ContentAPI } from '../../services/api';
import { FadeUp } from '../../animations/textReveal';
import Seo from '../../components/seo/Seo';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ContentAPI.reviews()
      .then((r) => setReviews(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-shell">
      <Seo
        title="Client Reviews"
        path="/reviews"
        description="Real reviews of Velour Men's Salon Faisalabad — why clients call us a top barber shop for fades, cuts, and grooming."
      />
      <FadeUp>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Reviews</p>
        <h1 className="page-title">Stories of glow.</h1>
      </FadeUp>
      {!reviews.length ? (
        <div className="mt-10"><EmptyState title="No reviews yet" /></div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 xl:grid-cols-3">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </div>
  );
}
