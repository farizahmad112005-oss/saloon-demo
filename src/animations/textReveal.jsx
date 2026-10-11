import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

export const easeLuxury = [0.22, 1, 0.36, 1];

export const pageEnter = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easeLuxury },
  },
};

export const staggerChildren = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

export const cardRise = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: easeLuxury },
  },
};

/** Split-line heading with clip reveal. Accepts `lines` array or children string. */
export function RevealHeading({ lines, children, className = '', as: Tag = 'h1' }) {
  const reduced = useReducedMotion();
  const list = Array.isArray(lines)
    ? lines
    : children != null
      ? [children]
      : [];

  return (
    <div className={className}>
      {list.map((line, i) => (
        <div key={String(line) + i} className="overflow-hidden">
          <motion.div
            initial={reduced ? false : { y: '105%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.85, delay: 0.12 + i * 0.14, ease: easeLuxury }}
          >
            <Tag className="font-display text-[clamp(2.5rem,8vw,6.5rem)] leading-[0.95] tracking-tight text-burgundy">
              {line}
            </Tag>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

/** Character / word stagger for short taglines */
export function MotionText({
  text = '',
  className = '',
  mode = 'words',
  delay = 0,
  as: Tag = 'p',
}) {
  const reduced = useReducedMotion();
  const parts = mode === 'chars' ? Array.from(text) : text.split(' ');

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className} aria-label={text}>
      {parts.map((part, i) => (
        <motion.span
          key={`${part}-${i}`}
          className="inline-block"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: delay + i * (mode === 'chars' ? 0.02 : 0.05), ease: easeLuxury }}
        >
          {part}
          {mode === 'words' && i < parts.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </Tag>
  );
}

export function FadeUp({ children, delay = 0, className = '' }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: easeLuxury }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className = '' }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduced ? undefined : staggerChildren}
      initial={reduced ? false : 'hidden'}
      whileInView={reduced ? undefined : 'show'}
      viewport={{ once: true, margin: '-40px' }}
    >
      {children}
    </motion.div>
  );
}

export function RiseItem({ children, className = '' }) {
  const reduced = useReducedMotion();
  return (
    <motion.div className={className} variants={reduced ? undefined : cardRise}>
      {children}
    </motion.div>
  );
}
