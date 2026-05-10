import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { STUDENT_BASE } from '../layouts/StudentLayout';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { FiClipboard, FiBook, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import api from '../services/api';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import { format } from 'date-fns';

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        if (!cancelled && data.success) setStats(data.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const chartData = [
    { name: 'Done', value: stats?.assignments?.completed || 0 },
    { name: 'Pending', value: stats?.assignments?.pending || 0 },
  ];

  const statCards = [
    {
      label: 'Courses tracked',
      value: stats?.credits?.courseCount ?? 0,
      hint: `${stats?.credits?.total ?? 0} total credits`,
      icon: FiBook,
      to: `${STUDENT_BASE}/courses`,
    },
    {
      label: 'Assignments',
      value: stats?.assignments?.total ?? 0,
      hint: `${stats?.assignments?.completed ?? 0} completed`,
      icon: FiClipboard,
      to: `${STUDENT_BASE}/assignments`,
    },
    {
      label: 'Semester progress',
      value: stats?.semesterProgressPercent != null ? `${stats.semesterProgressPercent}%` : '—',
      hint: stats?.currentSemester?.name || 'Set a current semester',
      icon: FiTrendingUp,
      to: `${STUDENT_BASE}/tracker`,
    },
    {
      label: 'Attendance',
      value: stats?.attendancePercentage != null ? `${stats.attendancePercentage}%` : '—',
      hint: 'Log sessions under tracker tools',
      icon: FiCalendar,
      to: `${STUDENT_BASE}/tracker`,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => (
          <Link key={s.label} to={s.to}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-indigo-500/15">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{s.value}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.hint}</p>
                </div>
                <span className="rounded-xl bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-300">
                  <s.icon className="h-5 w-5" />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Assignment workload</h2>
            <span className="text-xs text-slate-500">Live from your account</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming exams</h2>
          <ul className="mt-4 space-y-3">
            {(stats?.upcomingExams || []).length === 0 && (
              <p className="text-sm text-slate-500">No upcoming exams. Add some in the Exams tab.</p>
            )}
            {(stats?.upcomingExams || []).map((ex) => (
              <li
                key={ex.id}
                className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <p className="font-medium text-slate-900 dark:text-white">{ex.title}</p>
                <p className="text-xs text-slate-500">{ex.courseTitle}</p>
                <p className="mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {format(new Date(ex.examDate), 'MMM d, yyyy')}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl bg-gradient-to-r from-indigo-600/10 to-violet-600/10 p-4">
            <p className="text-xs uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Estimated GPA</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
              {stats?.gradeOverview?.estimatedGpa != null ? stats.gradeOverview.estimatedGpa.toFixed(2) : '—'}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Heuristic from assignments & exams</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
