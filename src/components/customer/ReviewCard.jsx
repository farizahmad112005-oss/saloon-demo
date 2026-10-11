import { Star } from 'lucide-react';

export default function ReviewCard({ review }) {
  return (
    <article className="glass flex h-full flex-col rounded-[18px] p-3 sm:rounded-[28px] sm:p-6">
      <div className="mb-2 flex gap-0.5 text-gold sm:mb-3 sm:gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            className="sm:h-4 sm:w-4"
            fill={i < review.rating ? 'currentColor' : 'none'}
          />
        ))}
      </div>
      <p className="line-clamp-4 font-display text-base leading-snug text-burgundy sm:line-clamp-none sm:text-2xl">
        “{review.comment || 'A sharp, professional experience.'}”
      </p>
      <div className="mt-auto pt-3 text-xs sm:mt-5 sm:text-sm">
        <p className="font-medium text-ink">{review.customer_name}</p>
        <p className="truncate text-muted">{review.service_name}</p>
      </div>
    </article>
  );
}
