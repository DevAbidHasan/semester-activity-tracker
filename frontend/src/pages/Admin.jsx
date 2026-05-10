import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

export default function Admin() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const [aRes, uRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users', { params: { page, limit: 12, q: q || undefined } }),
      ]);
      if (aRes.data.success) setAnalytics(aRes.data.data);
      if (uRes.data.success) {
        setUsers(uRes.data.data);
        setMeta(uRes.data.meta);
      }
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = (e) => {
    e.preventDefault();
    load(1);
  };

  const removeUser = async (id) => {
    if (!confirm('Delete this user and all related academic data?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User removed');
      load(meta.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Admin dashboard</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">System-wide analytics and user management.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total users', value: analytics?.totalUsers },
          { label: 'Active (30d)', value: analytics?.activeUsers30d },
          { label: 'New (7d)', value: analytics?.registeredLast7Days },
          { label: 'Assignments', value: analytics?.totalAssignments },
          { label: 'Courses', value: analytics?.totalCourses },
          { label: 'Exams', value: analytics?.totalExams },
          { label: 'Notes', value: analytics?.totalNotes },
        ].map((c) => (
          <Card key={c.label}>
            <p className="text-xs font-semibold uppercase text-slate-500">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{c.value ?? '—'}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" padding="p-0 overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <form
              onSubmit={search}
              className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-2"
            >
              <input
                placeholder="Search users…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              />
              <Button type="submit" variant="outline" className="w-full shrink-0 sm:w-auto">
                Filter
              </Button>
            </form>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/80 text-left text-xs uppercase text-slate-500 dark:bg-slate-900/60">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">{u.role}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        onClick={() => removeUser(u.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 p-3 dark:border-slate-800">
            <Button variant="outline" disabled={meta.page <= 1} onClick={() => load(meta.page - 1)}>
              Prev
            </Button>
            <Button variant="outline" disabled={meta.page >= meta.pages} onClick={() => load(meta.page + 1)}>
              Next
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent signups</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(analytics?.recentUsers || []).map((u) => (
              <li key={u.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="font-medium text-slate-900 dark:text-white">{u.email}</p>
                <p className="text-xs capitalize text-slate-500">{u.role}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
