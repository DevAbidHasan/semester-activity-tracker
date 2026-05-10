import { Link, Outlet } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { HeaderThemeToggle } from '../components/HeaderActionsRight';

export default function PublicDocumentLayout() {
  return (
    <div className="relative min-h-screen bg-linear-to-b from-slate-50 via-white to-indigo-50/40 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 dark:text-slate-100">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35] dark:opacity-25"
        style={{
          backgroundImage: `radial-gradient(at 20% 0%, rgba(99, 102, 241, 0.22) 0px, transparent 50%),
            radial-gradient(at 80% 10%, rgba(167, 139, 250, 0.18) 0px, transparent 45%),
            radial-gradient(at 50% 100%, rgba(56, 189, 248, 0.08) 0px, transparent 40%)`,
        }}
      />

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-4xl flex-nowrap items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          <Link
            to="/"
            className="group inline-flex min-w-0 shrink items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-indigo-300"
          >
            <FiHome className="h-4 w-4 shrink-0 opacity-80 transition group-hover:opacity-100" aria-hidden />
            <span>Home</span>
          </Link>
          <HeaderThemeToggle appearance="onLight" />
        </div>
      </header>

      <div className="relative mx-auto max-w-4xl overflow-x-hidden px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
        <Outlet />
      </div>
    </div>
  );
}
