import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const points = [
  'Courses, assignments, exams, and schedule in one glass dashboard',
  'JWT-secured API with role-based admin tools',
  'Dark mode, analytics, and semester progress at a glance',
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 text-white">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/20 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm font-bold">ST</span>
          <span className="font-semibold tracking-tight">Semester Tracker</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold shadow-lg shadow-indigo-500/30 ring-1 ring-white/20 backdrop-blur hover:bg-white/20"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">Academic OS</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            A calm, modern home for your entire semester.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-indigo-100/90">
            Organize courses, deadlines, exams, and notes with a polished dashboard that feels like your favorite SaaS
            productivity suite.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-indigo-900 shadow-xl shadow-indigo-900/40 transition hover:-translate-y-0.5"
            >
              Create free account
              <FiArrowRight />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/10"
            >
              View demo login
            </Link>
          </div>
          <ul className="mt-10 space-y-3 text-sm text-indigo-100/90">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Courses', value: '12', hint: 'Color-coded & searchable' },
                { label: 'Assignments', value: '28', hint: 'Statuses & priorities' },
                { label: 'Exams', value: '6', hint: 'Calendar-ready' },
                { label: 'GPA insight', value: '3.8', hint: 'Heuristic estimate' },
              ].map((c) => (
                <div
                  key={c.label}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/0 p-4"
                >
                  <p className="text-xs uppercase tracking-wide text-indigo-200">{c.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{c.value}</p>
                  <p className="mt-1 text-xs text-indigo-100/80">{c.hint}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-sm text-indigo-100/90">
              Tip: seed the API with <code className="rounded bg-black/30 px-1.5 py-0.5">npm run seed</code>. Students
              use <code className="rounded bg-black/30 px-1.5 py-0.5">demo@semestertracker.dev</code> →{' '}
              <code className="rounded bg-black/30 px-1.5 py-0.5">/student</code>. Admins (
              <code className="rounded bg-black/30 px-1.5 py-0.5">admin@semestertracker.dev</code>) land on{' '}
              <code className="rounded bg-black/30 px-1.5 py-0.5">/admin</code>.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
