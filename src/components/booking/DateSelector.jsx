import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function DateSelector({ days = [], selected, onSelect }) {
  const reduced = useReducedMotion();

  return (
    <div className="relative">
      <div className="edge-fade-x snap-x-row hide-scrollbar -mx-1 px-1">
        {days.map((day, index) => {
          const disabled = !day.isAvailableDay;
          const active = selected === day.date;
          const dayNum = day.displayDate?.split(' ')[0] || day.date?.slice(-2);

          return (
            <motion.button
              key={day.date}
              type="button"
              disabled={disabled}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.35), duration: 0.35 }}
              whileTap={disabled ? undefined : { scale: 0.96 }}
              onClick={() => onSelect(day.date)}
              className={`flex min-h-[104px] w-[92px] flex-col items-center justify-center rounded-[22px] px-3 py-3 text-center transition sm:min-h-[112px] sm:w-[104px] ${
                disabled
                  ? 'cursor-not-allowed bg-[#151515] text-muted/40'
                  : active
                    ? 'bg-gold text-black shadow-[0_14px_28px_rgba(197,160,89,0.28)]'
                    : 'bg-nude text-ink ring-1 ring-white/10 active:bg-gold/15'
              }`}
            >
              <span className={`text-[10px] uppercase tracking-[0.18em] ${active ? 'text-black/70' : 'text-muted'}`}>
                {day.label}
              </span>
              <span className="mt-1 font-display text-3xl leading-none sm:text-4xl">{dayNum}</span>
              <span className={`mt-1 text-[11px] ${active ? 'text-black/65' : 'text-muted'}`}>
                {day.displayDate?.split(' ').slice(1).join(' ') || ''}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
