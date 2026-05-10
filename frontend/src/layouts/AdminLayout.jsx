import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiLogOut, FiMenu, FiMoon, FiShield, FiSun, FiSunrise } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useMediaQuery } from '../hooks/useMediaQuery';

/** Admin-only area — separate from `/student`. */
export const ADMIN_BASE = '/admin';

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
      className="flex items-center gap-2 rounded-xl border border-violet-200/80 bg-white/60 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-violet-400 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200"
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/15 text-violet-800 dark:text-violet-200'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950/40 to-slate-950 dark:from-black dark:via-violet-950/30 dark:to-slate-950">
      {!isDesktop && drawerOpen && (
        <button type="button" className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeDrawer} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-violet-500/20 bg-slate-900/90 p-6 shadow-2xl shadow-violet-900/40 backdrop-blur-xl transition lg:translate-x-0 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link to={ADMIN_BASE} className="mb-8 flex items-center gap-2" onClick={closeDrawer}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-lg font-bold text-white shadow-lg shadow-violet-500/30">
            <FiShield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Admin console</p>
            <p className="text-xs text-violet-200/80">System management</p>
          </div>
        </Link>
        <nav className="flex flex-col gap-1">
          <NavLink to={ADMIN_BASE} end className={linkClass} onClick={closeDrawer}>
            <FiShield className="h-5 w-5 shrink-0" />
            Dashboard
          </NavLink>
        </nav>
        <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
          <p className="truncate text-sm font-medium text-white">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="truncate text-xs text-violet-200/70">{user?.email}</p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/10 bg-slate-900/70 px-4 py-3 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex rounded-xl border border-white/15 bg-white/5 p-2 text-white lg:hidden"
              onClick={() => setDrawerOpen((o) => !o)}
            >
              <FiMenu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs uppercase tracking-wide text-fuchsia-300/90">Restricted</p>
              <h1 className="text-lg font-semibold text-white">Administrator</h1>
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
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:border-rose-400/60 hover:bg-rose-500/10"
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
