import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { STUDENT_BASE } from '../layouts/StudentLayout';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { FiClipboard, FiBook, FiCalendar, FiTrendingUp, FiChevronRight } from 'react-icons/fi';
import api from '../services/api';
import Card from '../components/Card';
import CourseClassesViz from '../components/CourseClassesViz';
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
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => (
          <Link key={s.label} to={s.to}>
            <Card
              padding="p-3.5 sm:p-4"
              className="h-full border border-indigo-200/80 bg-white shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/10 transition hover:-translate-y-0.5 hover:border-indigo-400/80 hover:shadow-lg hover:shadow-indigo-500/15 dark:border-indigo-500/30 dark:bg-slate-900 dark:shadow-black/30 dark:ring-indigo-400/15 dark:hover:border-indigo-400/45"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase leading-tight tracking-wide text-indigo-600 dark:text-indigo-300 sm:text-xs">
                    {s.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums leading-tight tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs font-medium leading-snug text-slate-600 dark:text-slate-400">{s.hint}</p>
                </div>
                <span className="shrink-0 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 p-2 text-white shadow-sm shadow-indigo-500/25 sm:p-2.5">
                  <s.icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CourseClassesViz
          classesByCourse={
            stats?.classesByCourse ?? { last7Days: [], last14Days: [], last28Days: [] }
          }
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Assignment workload</h2>
            <span className="text-xs text-slate-500">Synced with your workspace</span>
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

        <Card className="border-2 border-indigo-200/70 bg-linear-to-b from-white to-indigo-50/50 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/10 dark:border-indigo-500/35 dark:from-slate-900 dark:to-indigo-950/40 dark:shadow-black/30 dark:ring-indigo-400/15">
          <div className="flex items-start justify-between gap-3 border-b border-indigo-200/60 pb-4 dark:border-indigo-500/25">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Schedule</p>
              <h2 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30">
                  <FiCalendar className="h-4 w-4" aria-hidden />
                </span>
                <span>Upcoming exams</span>
              </h2>
            </div>
            <Link
              to={`${STUDENT_BASE}/exams`}
              className="group flex shrink-0 items-center gap-0.5 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              View all
              <FiChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
          <ul className="mt-5 space-y-4">
            {(stats?.upcomingExams || []).length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                No upcoming exams.{' '}
                <Link to={`${STUDENT_BASE}/exams`} className="font-semibold text-indigo-600 dark:text-indigo-400">
                  Add exams
                </Link>{' '}
                to see them here.
              </p>
            )}
            {(stats?.upcomingExams || []).map((ex, idx) => (
              <li
                key={ex.id}
                className={`relative overflow-hidden rounded-2xl border bg-white p-4 shadow-md transition hover:shadow-lg dark:bg-slate-900/95 ${
                  idx === 0
                    ? 'border-indigo-300/90 ring-2 ring-indigo-500/20 dark:border-indigo-500/50 dark:ring-indigo-400/25'
                    : 'border-slate-200/90 dark:border-slate-700/90'
                }`}
              >
                <div
                  className="absolute inset-y-3 left-0 w-1.5 rounded-full"
                  style={{ backgroundColor: ex.courseColor || '#6366f1' }}
                  aria-hidden
                />
                <div className="pl-4">
                  {idx === 0 && (
                    <span className="mb-2 inline-block rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-200">
                      Next exam
                    </span>
                  )}
                  <p className="text-lg font-bold leading-snug text-slate-900 dark:text-white">{ex.title}</p>
                  <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{ex.courseTitle}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <time
                      dateTime={ex.examDate}
                      className="inline-flex items-center rounded-lg bg-indigo-50 px-3 py-1.5 text-base font-bold tabular-nums text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-100"
                    >
                      {format(new Date(ex.examDate), 'EEE, MMM d, yyyy')}
                    </time>
                    {ex.examType && (
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium capitalize text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {ex.examType}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
