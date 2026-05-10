import { Link } from 'react-router-dom';
import Button from '../components/Button';
import HeaderActionsRight from '../components/HeaderActionsRight';
import SiteFooterLegal from '../components/SiteFooterLegal';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { isAuthenticated, isAdmin } = useAuth();
  const homeHref = !isAuthenticated ? '/login' : isAdmin ? '/admin' : '/student';
  const homeLabel = !isAuthenticated ? 'Sign in' : isAdmin ? 'Admin home' : 'Student home';

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/40">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/25">
              ST
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">Semester Tracker</span>
          </Link>
          <HeaderActionsRight appearance="onLight" />
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900 dark:text-white">Page not found</h1>
        <p className="mt-3 max-w-md text-center text-slate-600 dark:text-slate-400">
          The page you are looking for does not exist or was moved. Use the button below to return to your area of the
          app.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to={homeHref}>
            <Button>{homeLabel}</Button>
          </Link>
          <Link to="/">
            <Button variant="outline">Home</Button>
          </Link>
        </div>
      </div>
      <footer className="border-t border-slate-200/80 py-6 dark:border-slate-800">
        <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 px-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Semester Tracker</p>
          <SiteFooterLegal variant="onLight" />
        </div>
      </footer>
    </div>
  );
}
