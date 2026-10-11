import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mediaUrl } from '../../utils/format';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import Button from '../ui/Button';

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0.85 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0.85 }),
};

export default function BannerSlider({ banners = [] }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const items = banners.filter((b) => b.is_active !== 0);

  const goTo = (next, dir = 1) => {
    setDirection(dir);
    setIndex(((next % items.length) + items.length) % items.length);
  };

  useEffect(() => {
    if (items.length <= 1) return undefined;
    const id = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % items.length);
    }, 6000);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;
  const current = items[index % items.length];

  return (
    <section className="overflow-hidden rounded-[20px] bg-blush sm:rounded-[28px]">
      <div className="relative aspect-[2/1] w-full overflow-hidden bg-blush/20 sm:aspect-[3/1]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={current.id}
            src={mediaUrl(current.image)}
            alt={current.title}
            custom={direction}
            variants={reduced ? undefined : slideVariants}
            initial={reduced ? false : 'enter'}
            animate={reduced ? undefined : 'center'}
            exit={reduced ? undefined : 'exit'}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='700'%3E%3Crect fill='%23C97B84' width='1600' height='700'/%3E%3C/svg%3E";
            }}
          />
        </AnimatePresence>

        {items.length > 1 ? (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ivory text-burgundy"
              onClick={() => goTo(index - 1, -1)}
              aria-label="Previous banner"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ivory text-burgundy"
              onClick={() => goTo(index + 1, 1)}
              aria-label="Next banner"
            >
              <ChevronRight size={20} />
            </button>
          </>
        ) : null}
      </div>

      <div className="px-4 py-4 sm:px-8 sm:py-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-end justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl text-burgundy sm:text-3xl md:text-4xl">{current.title}</p>
              {current.subtitle ? (
                <p className="mt-1 max-w-2xl text-sm text-muted sm:text-base">{current.subtitle}</p>
              ) : null}
            </div>
            {current.cta_text ? (
              <Button as={Link} to={current.cta_url || '/booking'} variant="gold" className="!py-2 !px-5 text-sm">
                {current.cta_text}
              </Button>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {items.length > 1 ? (
          <div className="mt-4 flex gap-2">
            {items.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`Go to banner ${i + 1}`}
                onClick={() => goTo(i, i > index ? 1 : -1)}
                className={`h-2 rounded-full transition-all ${i === index % items.length ? 'w-6 bg-burgundy' : 'w-2 bg-blush'}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
