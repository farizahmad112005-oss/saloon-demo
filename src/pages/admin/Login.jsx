import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { AuthAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAdmin, booting } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  if (!booting && isAdmin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await AuthAPI.adminLogin({ email, password });
      login(data.data);
      toast.success('Welcome, admin');
      navigate('/admin');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(197,160,89,0.18),transparent_45%),#0a0a0a] px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-[32px] border border-white/10 bg-blush p-8 shadow-2xl">
        <div className="mb-2 flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-14 w-14 object-contain" />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-gold">Admin Access</p>
            <h1 className="font-display text-4xl tracking-[0.08em] text-burgundy">Velour</h1>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">Sign in to manage appointments, slots, and salon content.</p>
        <label className="mt-8 block text-sm text-muted">
          Email
          <input
            type="email"
            autoComplete="username"
            required
            placeholder="Admin email"
            className="mt-1 w-full rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="mt-4 block text-sm text-muted">
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            placeholder="Password"
            className="mt-1 w-full rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <Button type="submit" className="mt-6 w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </Button>
      </form>
    </div>
  );
}
