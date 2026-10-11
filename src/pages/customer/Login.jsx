import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { AuthAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FadeUp } from '../../animations/textReveal';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', age: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } =
        mode === 'login'
          ? await AuthAPI.customerLogin({ phone: form.phone, password: form.password })
          : await AuthAPI.customerRegister({
              name: form.name,
              phone: form.phone,
              email: form.email || undefined,
              password: form.password,
              age: form.age ? Number(form.age) : undefined,
            });
      login(data.data);
      toast.success(mode === 'login' ? 'Welcome back' : 'Account created');
      navigate('/appointments');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex min-h-[70vh] max-w-md flex-col justify-center">
      <FadeUp>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Customer</p>
        <h1 className="page-title">{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
      </FadeUp>
      <form onSubmit={submit} className="mt-6 space-y-3 rounded-[24px] border border-white/8 bg-blush p-5 sm:mt-8 sm:rounded-[28px] sm:p-6">
        {mode === 'register' ? (
          <>
            <input required placeholder="Full name" className="w-full rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy placeholder:text-muted" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Age" type="number" className="w-full rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy placeholder:text-muted" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            <input placeholder="Email (optional)" type="email" className="w-full rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy placeholder:text-muted" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </>
        ) : null}
        <input required placeholder="Phone" className="w-full rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy placeholder:text-muted" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input required type="password" placeholder="Password" className="w-full rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy placeholder:text-muted" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}</Button>
      </form>
      <button type="button" className="mt-4 min-h-[44px] text-sm text-muted" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
      </button>
      <Link to="/appointments" className="mt-1 text-sm text-gold">Continue as guest - lookup by phone</Link>
    </div>
  );
}
