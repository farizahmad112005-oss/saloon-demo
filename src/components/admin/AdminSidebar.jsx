import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Clock3, Scissors, Tags, Sparkles, Package, Percent,
  Image, MessageSquareHeart, Users, Settings, UserRound, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/admin/slots', label: 'Slot Manager', icon: Clock3 },
  { to: '/admin/staff', label: 'Staff', icon: Scissors },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/services', label: 'Services', icon: Sparkles },
  { to: '/admin/packages', label: 'Packages', icon: Package },
  { to: '/admin/discounts', label: 'Discounts', icon: Percent },
  { to: '/admin/banners', label: 'Banners', icon: Image },
  { to: '/admin/feedback', label: 'Feedback', icon: MessageSquareHeart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/profile', label: 'Admin Profile', icon: UserRound },
];

export default function AdminSidebar({ open, onClose }) {
  const { logout } = useAuth();

  return (
    <>
      {open ? <button type="button" className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} /> : null}
      <aside className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] shrink-0 transform flex-col border-r border-white/8 bg-[#0c0c0c] text-burgundy transition lg:static lg:h-full lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-5 py-5">
          <img src="/logo.png" alt="" className="h-12 w-12 object-contain" />
          <div>
            <p className="font-display text-2xl tracking-[0.08em]">Velour</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold">Admin</p>
          </div>
        </div>
        <nav className="hide-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-4">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  isActive ? 'bg-gold/15 text-gold' : 'text-champagne hover:bg-white/5 hover:text-burgundy'
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={logout}
            className="mt-4 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-champagne hover:bg-white/5"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>
    </>
  );
}
