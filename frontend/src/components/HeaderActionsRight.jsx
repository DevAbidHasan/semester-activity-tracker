import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheck, FiLayout, FiLogOut, FiMoon, FiSun, FiSunrise } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const themeShell = {
  onDark:
    'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60',
  onLight:
    'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-indigo-400/60',
};

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', Icon: FiSun },
  { value: 'dark', label: 'Dark', Icon: FiMoon },
  { value: 'system', label: 'System', Icon: FiSunrise },
];

const MENU_GAP = 8;
const VIEW_PAD = 10;

function placeThemeMenu(triggerEl, menuEl) {
  if (!triggerEl || !menuEl) return;
  const tr = triggerEl.getBoundingClientRect();
  const mw = menuEl.offsetWidth;
  const mh = menuEl.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Prefer below the trigger, right edges aligned with the theme button
  let top = tr.bottom + MENU_GAP;
  let left = tr.right - mw;

  if (top + mh > vh - VIEW_PAD) {
    top = tr.top - MENU_GAP - mh;
  }
  if (top < VIEW_PAD) {
    top = VIEW_PAD;
  }
  left = Math.max(VIEW_PAD, Math.min(left, vw - mw - VIEW_PAD));

  menuEl.style.position = 'fixed';
  menuEl.style.left = `${Math.round(left)}px`;
  menuEl.style.top = `${Math.round(top)}px`;
  menuEl.style.right = 'auto';
  menuEl.style.bottom = 'auto';
}

export function HeaderThemeToggle({ appearance = 'onLight' }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!open) return;
    const run = () => placeThemeMenu(triggerRef.current, menuRef.current);
    run();
    const raf = requestAnimationFrame(run);
    window.addEventListener('resize', run);
    window.addEventListener('scroll', run, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', run);
      window.removeEventListener('scroll', run, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e) => {
      const el = e.target;
      if (triggerRef.current?.contains(el) || menuRef.current?.contains(el)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const Icon = theme === 'dark' ? FiMoon : theme === 'light' ? FiSun : FiSunrise;
  const label = theme === 'system' ? 'System theme' : theme === 'dark' ? 'Dark mode' : 'Light mode';
  const isDark = appearance === 'onDark';

  const panel =
    isDark
      ? 'rounded-xl border border-white/15 bg-slate-950/98 py-1 shadow-2xl shadow-black/40 backdrop-blur-md'
      : 'rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/10 backdrop-blur-md dark:border-slate-600 dark:bg-slate-900';

  const itemBase =
    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium transition outline-none focus-visible:bg-indigo-500/15';

  const itemIdle = isDark
    ? 'text-slate-200 hover:bg-white/10'
    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800';

  const itemActive = isDark ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200';

  const menu =
    open &&
    createPortal(
      <div
        ref={menuRef}
        role="menu"
        aria-label="Theme"
        className={`z-200 min-w-42 ${panel}`}
      >
        {THEME_OPTIONS.map(({ value, label: optLabel, Icon: OptIcon }) => {
          const selected = theme === value;
          return (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={selected}
              className={`${itemBase} ${selected ? itemActive : itemIdle}`}
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
            >
              <OptIcon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              <span className="flex-1">{optLabel}</span>
              {selected ? (
                <FiCheck
                  className={`h-4 w-4 shrink-0 ${isDark ? 'text-emerald-300' : 'text-indigo-600 dark:text-indigo-300'}`}
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>,
      document.body
    );

  return (
    <div className="inline-flex shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Appearance: ${label}. Choose theme.`}
        title={label}
        onClick={() => setOpen((o) => !o)}
        className={themeShell[isDark ? 'onDark' : 'onLight']}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </button>
      {menu}
    </div>
  );
}

/**
 * Right side of headers: optional guest links, then when authenticated Dashboard + Logout, then theme.
 */
export default function HeaderActionsRight({ appearance = 'onLight', guestSlot = null }) {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const dashboardHref = isAdmin ? '/admin' : '/student';

  const dashBtn =
    appearance === 'onDark'
      ? 'inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15'
      : 'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-indigo-400/60';

  const logoutBtn =
    appearance === 'onDark'
      ? 'inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:border-rose-400/50 hover:bg-rose-500/10'
      : 'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-rose-200 hover:text-rose-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100';

  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      {guestSlot}
      {isAuthenticated ? (
        <>
          <Link to={dashboardHref} className={dashBtn}>
            <FiLayout className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className={logoutBtn}
          >
            <FiLogOut className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </>
      ) : null}
      <HeaderThemeToggle appearance={appearance} />
    </div>
  );
}
