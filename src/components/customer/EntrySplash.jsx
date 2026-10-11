import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function EntrySplash() {
  const reduced = useReducedMotion();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!isHome) return undefined;

    setExiting(false);
    setVisible(true);
    document.body.classList.add('drawer-open');

    const hold = reduced ? 600 : 1600;
    const exitMs = reduced ? 250 : 450;
    const t1 = setTimeout(() => setExiting(true), hold);
    const t2 = setTimeout(() => {
      setVisible(false);
      document.body.classList.remove('drawer-open');
    }, hold + exitMs);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.classList.remove('drawer-open');
    };
  }, [reduced, isHome]);

  const skip = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      document.body.classList.remove('drawer-open');
    }, reduced ? 150 : 350);
  };

  if (!isHome) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.25 : 0.45, ease: [0.4, 0, 0.2, 1] }}
          onClick={skip}
          role="presentation"
        >
          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            <motion.img
              src="/logo.png"
              alt="Velour"
              className="h-24 w-24 object-contain sm:h-28 sm:w-28"
              initial={reduced ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.h1
              className="mt-5 font-display text-[clamp(2.5rem,8vw,3.75rem)] tracking-[0.14em] text-[#F0EDE6]"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduced ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              Velour
            </motion.h1>
            <motion.p
              className="mt-3 text-[10px] uppercase tracking-[0.35em] text-[#C5A059]"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: reduced ? 0 : 0.35 }}
            >
              Men&apos;s Hair Salon
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
