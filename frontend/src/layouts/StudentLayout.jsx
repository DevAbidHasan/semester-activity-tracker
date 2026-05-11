import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiBarChart2,
  FiBook,
  FiCalendar,
  FiClipboard,
  FiHome,
  FiLayout,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiEdit3,
  FiTrendingUp,
  FiX,
} from 'react-icons/fi';
import HeaderActionsRight, { HeaderThemeToggle } from '../components/HeaderActionsRight';
import { useAuth } from '../context/AuthContext';
import { useMediaQuery } from '../hooks/useMediaQuery';

/** Student workspace base path in the router. */
export const STUDENT_BASE = '/student';

const nav = [
  { to: '/', label: 'Home', icon: FiHome },
  { to: `${STUDENT_BASE}`, label: 'Overview', icon: FiLayout },
  { to: `${STUDENT_BASE}/courses`, label: 'Courses', icon: FiBook },
  { to: `${STUDENT_BASE}/assignments`, label: 'Assignments', icon: FiClipboard },
  { to: `${STUDENT_BASE}/exams`, label: 'Exams', icon: FiTrendingUp },
  { to: `${STUDENT_BASE}/attendance`, label: 'Attendance', icon: FiCalendar },
  { to: `${STUDENT_BASE}/tracker`, label: 'Semester', icon: FiBarChart2 },
  { to: `${STUDENT_BASE}/notes`, label: 'Notes', icon: FiEdit3 },
  { to: `${STUDENT_BASE}/settings`, label: 'Settings', icon: FiSettings },
];

const iconBtn =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-indigo-400/60';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-gradient-to-r from-indigo-600/15 to-violet-600/10 text-indigo-700 dark:text-indigo-300'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
    }`;

  const drawerTranslate = isDesktop
    ? 'translate-x-0'
    : drawerOpen
      ? 'translate-x-0'
      : 'translate-x-full';

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30">
      {!isDesktop && drawerOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={closeDrawer}
        />
      )}

      <aside
        id="student-drawer"
        className={`fixed inset-y-0 z-50 flex h-full w-72 transform flex-col border-white/30 bg-white/80 p-6 shadow-xl shadow-indigo-500/10 backdrop-blur-xl transition-transform duration-200 ease-out dark:border-slate-800/80 dark:bg-slate-950/90 max-lg:right-0 max-lg:border-l max-lg:border-slate-200/80 lg:left-0 lg:border-r lg:translate-x-0 ${drawerTranslate} ${!isDesktop && !drawerOpen ? 'pointer-events-none' : ''}`}
      >
        <div className="mb-6 flex shrink-0 items-center justify-between gap-2">
          <Link to={STUDENT_BASE} className="flex min-w-0 flex-1 items-center gap-2" onClick={closeDrawer}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-lg font-bold text-white shadow-lg shadow-indigo-500/40">
              ST
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">Semester Tracker</p>
              <p className="truncate text-xs text-slate-500">Student workspace</p>
            </div>
          </Link>
          <button
            type="button"
            className={`${iconBtn} lg:hidden`}
            aria-label="Close menu"
            onClick={closeDrawer}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden overscroll-y-contain pr-1">
          {nav.map((item) => (
            <NavLink
              key={item.label + item.to}
              to={item.to}
              className={linkClass}
              onClick={closeDrawer}
              end={item.to === STUDENT_BASE || item.to === '/'}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 shrink-0 space-y-3 border-t border-slate-200/80 pt-4 dark:border-slate-800">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/80">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-rose-200 hover:text-rose-600 lg:hidden dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-rose-500/50 dark:hover:text-rose-300"
            onClick={() => {
              logout();
              closeDrawer();
              navigate('/login');
            }}
          >
            <FiLogOut className="h-4 w-4 shrink-0" aria-hidden />
            Log out
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/90 bg-white/95 px-4 py-2 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90 sm:gap-4 sm:px-8">
          <Link
            to={STUDENT_BASE}
            className="flex min-w-0 shrink-0 items-center gap-2 lg:hidden"
            onClick={closeDrawer}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/35">
              ST
            </div>
            <span className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-white sm:text-base">
              Semester Tracker
            </span>
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              <HeaderThemeToggle appearance="onLight" />
              <button
                type="button"
                className={iconBtn}
                aria-expanded={drawerOpen}
                aria-controls="student-drawer"
                aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setDrawerOpen((o) => !o)}
              >
                {drawerOpen ? <FiX className="h-5 w-5" aria-hidden /> : <FiMenu className="h-5 w-5" aria-hidden />}
              </button>
            </div>
            <div className="hidden lg:flex lg:shrink-0">
              <HeaderActionsRight appearance="onLight" />
            </div>
          </div>
        </header>

        <main className="px-4 pb-8 pt-4 sm:px-8 sm:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
