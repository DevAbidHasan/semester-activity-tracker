import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import HeaderActionsRight from '../components/HeaderActionsRight';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
      });
      toast.success('Account created');
      navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.message || err.friendlyMessage || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-950 dark:to-violet-950/40">
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
                  to="/login"
                  className="rounded-xl px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                >
                  Sign in
                </Link>
              ) : null
            }
          />
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md" padding="p-8">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Create account</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            Sign in
          </Link>
        </p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">First name</label>
              <input
                name="firstName"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900/80"
                value={form.firstName}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last name</label>
              <input
                name="lastName"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900/80"
                value={form.lastName}
                onChange={onChange}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.email}
              onChange={onChange}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password (min 8)</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.password}
              onChange={onChange}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
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
