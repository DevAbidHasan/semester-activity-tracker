import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';

function postLoginDestination(user, fromPath) {
  if (user.role === 'admin') {
    if (fromPath?.startsWith('/admin')) return fromPath;
    return '/admin';
  }
  if (fromPath?.startsWith('/student')) return fromPath;
  return '/student';
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname || null;
  const [email, setEmail] = useState('demo@semestertracker.dev');
  const [password, setPassword] = useState('Password123!');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(email, password);
      toast.success('Welcome back!');
      navigate(postLoginDestination(user, fromPath), { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || err.friendlyMessage || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/40">
      <Card className="w-full max-w-md" padding="p-8">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          New here?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            Create an account
          </Link>
        </p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm outline-none ring-indigo-500/30 focus:ring-2 dark:border-slate-700 dark:bg-slate-900/80"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm outline-none ring-indigo-500/30 focus:ring-2 dark:border-slate-700 dark:bg-slate-900/80"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Continue'}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">
          <Link to="/" className="hover:underline">
            ← Back to landing
          </Link>
        </p>
      </Card>
    </div>
  );
}
