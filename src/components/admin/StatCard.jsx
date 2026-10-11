import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

function AnimatedNumber({ value }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString('en-PK'));
  useEffect(() => {
    const controls = animate(mv, Number(value) || 0, { duration: 1.1 });
    return controls.stop;
  }, [value]);
  return <motion.span>{rounded}</motion.span>;
}

export default function StatCard({ title, value, icon: Icon, prefix = '', suffix = '' }) {
  return (
    <motion.article
      whileHover={{ y: -3 }}
      className="rounded-[28px] border border-white/8 bg-gradient-to-br from-blush to-nude p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">{title}</p>
          <p className="mt-3 font-display text-4xl text-burgundy">
            {prefix}
            <AnimatedNumber value={value} />
            {suffix}
          </p>
        </div>
        {Icon ? (
          <div className="rounded-2xl bg-gold/15 p-3 text-gold">
            <Icon size={22} />
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}
