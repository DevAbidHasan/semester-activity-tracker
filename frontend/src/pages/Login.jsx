import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import HeaderActionsRight from '../components/HeaderActionsRight';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';

function postLoginDestination(user, fromPath) {
  if (user.role === 'admin') {
    if (fromPath?.startsWith('/admin')) return fromPath;
    return '/admin';
  }
  if (fromPath?.startsWith('/student')) return fromPath;
  return '/student';
}

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname || null;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/40">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/25">
              ST
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">Semester Tracker</span>
          </Link>
          <HeaderActionsRight
            appearance="onLight"
            guestSlot={
              !isAuthenticated ? (
                <Link
                  to="/register"
                  className="rounded-xl px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                >
                  Register
                </Link>
              ) : null
            }
          />
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
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
              autoComplete="email"
              placeholder="you@university.edu"
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
              autoComplete="current-password"
              placeholder="••••••••"
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
    </div>
  );
}
