import { Link, Outlet } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function PublicDocumentLayout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-linear-to-b from-slate-50 via-white to-indigo-50/40 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 dark:text-slate-100">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35] dark:opacity-25"
        style={{
          backgroundImage: `radial-gradient(at 20% 0%, rgba(99, 102, 241, 0.22) 0px, transparent 50%),
            radial-gradient(at 80% 10%, rgba(167, 139, 250, 0.18) 0px, transparent 45%),
            radial-gradient(at 50% 100%, rgba(56, 189, 248, 0.08) 0px, transparent 40%)`,
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-indigo-300 hover:text-indigo-700 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-indigo-500/50 dark:hover:text-indigo-200"
        >
          <FiArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" aria-hidden />
          Back to Home
        </Link>

        <Outlet />
      </div>
    </div>
  );
}
