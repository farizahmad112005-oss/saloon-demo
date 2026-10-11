import { motion } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';
import { formatPKR, mediaUrl } from '../../utils/format';
import { cardRise } from '../../animations/textReveal';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const fallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23141414' width='400' height='400'/%3E%3C/svg%3E";

export default function BookingServiceCard({
  item,
  selected,
  onSelect,
  subtitle,
  price,
  duration,
  inactive = false,
  discount,
}) {
  const reduced = useReducedMotion();

  return (
    <motion.button
      type="button"
      variants={reduced ? undefined : cardRise}
      whileTap={inactive ? undefined : { scale: 0.985 }}
      disabled={inactive}
      onClick={() => onSelect(item.id)}
      className={`group w-full overflow-hidden rounded-[22px] text-left transition ${
        inactive
          ? 'cursor-not-allowed bg-[#151515] opacity-65'
          : selected
            ? 'bg-nude shadow-[0_16px_40px_rgba(197,160,89,0.18)] ring-2 ring-gold'
            : 'bg-blush ring-1 ring-white/10 active:ring-gold/50'
      }`}
    >
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-3.5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-28">
          <img
            src={mediaUrl(item.image) || fallback}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = fallback;
            }}
          />
          {selected ? (
            <span className="absolute inset-x-2 bottom-2 rounded-full bg-gold/95 py-0.5 text-center text-[10px] uppercase tracking-wider text-black">
              Selected
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-display text-xl text-burgundy sm:text-2xl">{item.name}</h3>
              {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
            </div>
            <div className="shrink-0 text-right">
              {discount ? (
                <>
                  <p className="text-[11px] text-muted line-through">{formatPKR(price)}</p>
                  <p className="text-sm font-semibold text-burgundy">{formatPKR(price - discount.amount)}</p>
                </>
              ) : (
                <p className="text-sm font-semibold text-burgundy">{formatPKR(price)}</p>
              )}
            </div>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted sm:text-sm">{item.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">
            {duration ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-nude px-2 py-1">
                <Clock size={12} /> {duration} min
              </span>
            ) : null}
            {discount ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-1 text-gold">
                <Sparkles size={12} /> {discount.code}
              </span>
            ) : null}
          </div>
          {inactive ? (
            <p className="mt-2 text-xs text-gold">This service is not available at the moment.</p>
          ) : null}
        </div>
      </div>
    </motion.button>
  );
}
