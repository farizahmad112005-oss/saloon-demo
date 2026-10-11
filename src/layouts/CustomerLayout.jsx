import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowUp, CalendarHeart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../components/customer/Navbar';
import Footer from '../components/customer/Footer';
import { ContentAPI } from '../services/api';

export default function CustomerLayout() {
  const [settings, setSettings] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const location = useLocation();
  const hideBookFab = location.pathname.startsWith('/booking') || location.pathname.startsWith('/admin');

  useEffect(() => {
    ContentAPI.settings().then((r) => setSettings(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? (scrolled / height) * 100 : 0);
      setShowTop(scrolled > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen min-h-dvh pb-[env(safe-area-inset-bottom)]">
      <div className="fixed left-0 top-0 z-[70] h-[2px] bg-gold transition-all" style={{ width: `${progress}%` }} />
      <Navbar />
      <main className="pb-20 lg:pb-0">
        <Outlet context={{ settings }} />
      </main>
      <Footer settings={settings} />

      <AnimatePresence>
        {showTop ? (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="safe-fab fixed left-4 z-40 rounded-full bg-burgundy p-3 text-ivory shadow-lg sm:left-6"
            aria-label="Back to top"
          >
            <ArrowUp size={18} />
          </motion.button>
        ) : null}
      </AnimatePresence>

      {!hideBookFab ? (
        <Link
          to="/booking"
          className="safe-fab fixed right-4 z-40 inline-flex items-center gap-2 rounded-full bg-burgundy px-4 py-3 text-sm font-medium text-ivory shadow-[0_12px_30px_rgba(107,45,60,0.35)] lg:hidden"
        >
          <CalendarHeart size={18} />
          Book
        </Link>
      ) : null}
    </div>
  );
}
