import { motion } from 'framer-motion';
import { mediaUrl } from '../../utils/format';

const fallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%231a1a1a'/%3E%3Cstop offset='1' stop-color='%232a2418'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='400' height='500'/%3E%3C/svg%3E";

export default function BarberCard({ barber, selected, onSelect }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(barber)}
      className={`group relative w-full overflow-hidden rounded-[22px] text-left transition ${
        selected
          ? 'ring-2 ring-gold shadow-[0_16px_40px_rgba(197,160,89,0.22)]'
          : 'ring-1 ring-white/10 hover:ring-gold/40'
      }`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-nude">
        <img
          src={mediaUrl(barber.photo) || fallback}
          alt={barber.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = fallback;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
        {selected ? (
          <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-black">
            Selected
          </span>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-display text-2xl tracking-wide text-[#F0EDE6]">{barber.name}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-gold">
            {barber.title || 'Barber'}
          </p>
          {barber.bio ? (
            <p className="mt-2 line-clamp-2 text-xs text-champagne/90">{barber.bio}</p>
          ) : null}
        </div>
      </div>
    </motion.button>
  );
}
