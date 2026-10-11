import { motion } from 'framer-motion';
import { formatTimeLabel } from '../../utils/format';
import { cardRise, staggerChildren } from '../../animations/textReveal';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function TimeSlotSelector({ slots = [], selected, onSelect }) {
  const reduced = useReducedMotion();
  const available = slots.filter((s) => s.available);

  if (!slots.length) {
    return (
      <p className="rounded-2xl bg-nude px-4 py-6 text-center text-sm text-muted">
        No time slots for this day.
      </p>
    );
  }

  if (!available.length) {
    return (
      <p className="rounded-2xl bg-nude px-4 py-6 text-center text-sm text-muted">
        All slots are booked or held for this day. Please choose another date.
      </p>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
      variants={reduced ? undefined : staggerChildren}
      initial={reduced ? false : 'hidden'}
      animate={reduced ? undefined : 'show'}
    >
      {slots.map((slot) => {
        const active = selected === slot.time;
        const blocked = slot.reason === 'blocked';
        return (
          <motion.button
            key={slot.time}
            type="button"
            variants={reduced ? undefined : cardRise}
            whileTap={slot.available ? { scale: 0.97 } : undefined}
            disabled={!slot.available}
            onClick={() => onSelect(slot.time)}
            title={blocked ? 'Held by salon (walk-in / closed)' : undefined}
            className={`min-h-[48px] rounded-2xl px-3 py-3 text-sm font-medium transition ${
              !slot.available
                ? blocked
                  ? 'cursor-not-allowed border border-gold/20 bg-gold/10 text-gold/50 line-through'
                  : 'cursor-not-allowed bg-[#1a1a1a] text-muted/50 line-through'
                : active
                  ? 'bg-gold text-black shadow-[0_10px_22px_rgba(197,160,89,0.28)]'
                  : 'bg-nude text-ink ring-1 ring-white/10 active:bg-gold/20'
            }`}
          >
            {formatTimeLabel(slot.time)}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
