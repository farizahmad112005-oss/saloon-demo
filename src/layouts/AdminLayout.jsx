import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function AdminLayout() {
  const { isAdmin, booting } = useAuth();
  const [open, setOpen] = useState(false);

  if (booting) return <LoadingSpinner label="Opening admin…" />;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="flex h-dvh overflow-hidden bg-ivory">
      <AdminSidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-3 border-b border-white/8 bg-blush/80 px-4 py-4 backdrop-blur lg:px-8">
          <button type="button" className="rounded-xl p-2 text-burgundy lg:hidden" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold">Salon Management</p>
            <h1 className="font-display text-2xl text-burgundy">Control Center</h1>
          </div>
        </header>
        <main className="hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
