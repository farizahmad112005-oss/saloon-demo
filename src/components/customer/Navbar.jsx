import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import BrandMark from './BrandMark';

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/packages', label: 'Packages' },
  { to: '/about', label: 'About' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/contact', label: 'Contact' },
  { to: '/appointments', label: 'My Appointments' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isCustomer, logout, user } = useAuth();

  useEffect(() => {
    document.body.classList.toggle('drawer-open', open);
    return () => document.body.classList.remove('drawer-open');
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const menu = (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/70 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="ml-auto flex h-full w-[min(88vw,360px)] flex-col border-l border-white/10 bg-blush shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between px-6 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
              <p className="font-display text-3xl text-burgundy">Menu</p>
              <button
                type="button"
                className="touch-target inline-flex items-center justify-center rounded-full p-2 text-burgundy"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X size={22} />
              </button>
            </div>

            <nav className="hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
              <div className="flex flex-col gap-1 pb-4">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `rounded-2xl px-3 py-3 font-display text-2xl transition ${
                        isActive ? 'bg-nude text-gold' : 'text-burgundy/90 active:bg-nude'
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
              </div>
            </nav>

            <div className="shrink-0 space-y-3 border-t border-white/10 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
              {isCustomer ? (
                <>
                  <p className="text-sm text-muted">Signed in as {user?.name}</p>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button as={Link} to="/login" variant="secondary" className="w-full" onClick={() => setOpen(false)}>
                  Login
                </Button>
              )}
              <Button as={Link} to="/booking" className="w-full" onClick={() => setOpen(false)}>
                Book Appointment
              </Button>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-ivory/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-5 md:px-6 md:py-3.5">
        <BrandMark to="/" size="md" />
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `text-sm tracking-wide transition ${isActive ? 'text-gold' : 'text-muted hover:text-burgundy'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {isCustomer ? (
            <>
              <span className="text-sm text-muted">Hi, {user?.name?.split(' ')[0]}</span>
              <Button variant="ghost" onClick={logout}>Logout</Button>
            </>
          ) : (
            <Button as={Link} to="/login" variant="secondary">Login</Button>
          )}
          <Button as={Link} to="/booking">Book Appointment</Button>
        </div>
        <button
          type="button"
          className="touch-target inline-flex items-center justify-center rounded-full p-2 text-burgundy lg:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu size={22} />
        </button>
      </div>

      {typeof document !== 'undefined' ? createPortal(menu, document.body) : null}
    </header>
  );
}
