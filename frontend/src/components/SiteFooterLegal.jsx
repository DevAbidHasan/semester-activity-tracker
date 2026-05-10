import { Link } from 'react-router-dom';

const variants = {
  onDark:
    'text-sm font-medium text-slate-400 transition hover:text-white',
  onLight:
    'text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300',
};

/**
 * Shared legal / company links for marketing and document footers.
 * @param {{ variant?: 'onDark' | 'onLight', className?: string }} props
 */
export default function SiteFooterLegal({ variant = 'onLight', className = '' }) {
  const linkClass = variants[variant] || variants.onLight;
  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-end ${className}`}
      aria-label="Legal and company"
    >
      <Link to="/about" className={linkClass}>
        About
      </Link>
      <Link to="/privacy" className={linkClass}>
        Privacy
      </Link>
      <Link to="/terms" className={linkClass}>
        Terms
      </Link>
    </nav>
  );
}
