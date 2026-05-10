import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';

export default function Register() {
  const { register } = useAuth();
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50 px-4 dark:from-slate-950 dark:via-slate-950 dark:to-violet-950/40">
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
  );
}
