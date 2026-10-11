import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const sizes = {
  sm: { img: 'h-9 w-9', text: 'text-xl' },
  md: { img: 'h-11 w-11 sm:h-12 sm:w-12', text: 'text-2xl sm:text-[1.65rem]' },
  lg: { img: 'h-16 w-16 sm:h-20 sm:w-20', text: 'text-3xl sm:text-4xl' },
};

export default function BrandMark({
  to = '/',
  size = 'md',
  showWordmark = true,
  className = '',
  animate = false,
}) {
  const s = sizes[size] || sizes.md;
  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <motion.img
        src="/logo.png"
        alt="Velour"
        className={`${s.img} object-contain`}
        initial={animate ? { opacity: 0, scale: 0.85, rotate: -6 } : false}
        animate={animate ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
      {showWordmark ? (
        <span className={`font-display tracking-[0.08em] text-burgundy ${s.text}`}>Velour</span>
      ) : null}
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center" aria-label="Velour Salon home">
        {inner}
      </Link>
    );
  }
  return inner;
}
