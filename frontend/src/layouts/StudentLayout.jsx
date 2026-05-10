import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiBook,
  FiCalendar,
  FiClipboard,
  FiHome,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSettings,
  FiSun,
  FiSunrise,
  FiEdit3,
  FiTrendingUp,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useMediaQuery } from '../hooks/useMediaQuery';

/** Student workspace base path in the router. */
export const STUDENT_BASE = '/student';

const nav = [
  { to: `${STUDENT_BASE}`, label: 'Overview', icon: FiHome },
  { to: `${STUDENT_BASE}/courses`, label: 'Courses', icon: FiBook },
  { to: `${STUDENT_BASE}/assignments`, label: 'Assignments', icon: FiClipboard },
  { to: `${STUDENT_BASE}/exams`, label: 'Exams', icon: FiTrendingUp },
  { to: `${STUDENT_BASE}/schedule`, label: 'Schedule', icon: FiCalendar },
  { to: `${STUDENT_BASE}/tracker`, label: 'Semester', icon: FiSunrise },
  { to: `${STUDENT_BASE}/notes`, label: 'Notes', icon: FiEdit3 },
  { to: `${STUDENT_BASE}/settings`, label: 'Settings', icon: FiSettings },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const cycle = () => {
    const order = ['light', 'dark', 'system'];
    const i = order.indexOf(theme);
    setTheme(order[(i + 1) % order.length]);
  };
  const Icon = theme === 'dark' ? FiMoon : theme === 'light' ? FiSun : FiSunrise;
  const label = theme === 'system' ? 'System theme' : theme === 'dark' ? 'Dark mode' : 'Light mode';
  return (
    <button
      type="button"
      onClick={cycle}
      title={label}
      className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30">
      {!isDesktop && drawerOpen && (
        <button type="button" className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={closeDrawer} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-white/30 bg-white/80 p-6 shadow-xl shadow-indigo-500/10 backdrop-blur-xl transition dark:border-slate-800/80 dark:bg-slate-950/90 lg:translate-x-0 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link to={STUDENT_BASE} className="mb-8 flex items-center gap-2" onClick={closeDrawer}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-bold text-white shadow-lg shadow-indigo-500/40">
            ST
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Semester Tracker</p>
            <p className="text-xs text-slate-500">Student workspace</p>
          </div>
        </Link>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} onClick={closeDrawer} end={item.to === STUDENT_BASE}>
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/40 bg-white/70 px-4 py-3 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex rounded-xl border border-slate-200 bg-white p-2 text-slate-700 lg:hidden dark:border-slate-700 dark:bg-slate-900"
              onClick={() => setDrawerOpen((o) => !o)}
            >
              <FiMenu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-600 dark:text-indigo-400">Student</p>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Academic command center</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-rose-200 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <FiLogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
