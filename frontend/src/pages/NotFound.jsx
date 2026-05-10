import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { isAuthenticated, isAdmin } = useAuth();
  const homeHref = !isAuthenticated ? '/login' : isAdmin ? '/admin' : '/student';
  const homeLabel = !isAuthenticated ? 'Sign in' : isAdmin ? 'Admin home' : 'Student home';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/40">
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
          <Button variant="outline">Landing</Button>
        </Link>
      </div>
    </div>
  );
}
