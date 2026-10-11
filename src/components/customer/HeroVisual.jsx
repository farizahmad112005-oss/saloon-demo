import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function HeroVisual() {
  const reduced = useReducedMotion();

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 sm:rounded-[36px]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#0d0d0d] to-[#2a2418]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(197,160,89,0.22),transparent_45%),radial-gradient(circle_at_80%_75%,rgba(80,80,80,0.35),transparent_50%)]" />

      {!reduced ? (
        <motion.div
          className="absolute -left-1/3 top-0 h-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-gold/20 to-transparent"
          animate={{ x: ['0%', '280%'] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
        />
      ) : null}

      <motion.div
        className="absolute left-1/2 top-[42%] h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/25"
        animate={reduced ? undefined : { scale: [1, 1.04, 1], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute left-1/2 top-[42%] h-[48%] w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

      <div className="absolute inset-0 flex items-center justify-center p-8">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[260px] overflow-hidden rounded-[28px] border border-gold/25 bg-black/50 p-8 text-center shadow-[0_30px_60px_rgba(0,0,0,0.45)] backdrop-blur-md"
        >
          <img src="/logo.png" alt="Velour" className="mx-auto mb-4 h-24 w-24 object-contain" />
          <p className="font-display text-4xl tracking-[0.12em] text-burgundy">Velour</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-gold">Men&apos;s Hair Salon</p>
          <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <p className="mt-4 font-display text-xl italic text-champagne">Cut. Fade. Finish.</p>
        </motion.div>
      </div>

      <div className="absolute left-4 top-4 h-10 w-10 rounded-tl-2xl border-l border-t border-gold/40" />
      <div className="absolute bottom-4 right-4 h-10 w-10 rounded-br-2xl border-b border-r border-gold/40" />
    </div>
  );
}
