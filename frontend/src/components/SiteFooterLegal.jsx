import { Link } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';

/** Primary contact shown in marketing footers (mailto). */
export const SITE_CONTACT_EMAIL = 'abidhasanplabon80@gmail.com';

const variants = {
  onDark:
    'text-sm font-medium text-slate-400 transition hover:text-white',
  onLight:
    'text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300',
  /** Landing footer: readable on light or near-black backgrounds. */
  adaptive:
    'text-sm font-medium text-slate-600 transition hover:text-indigo-700 dark:text-slate-400 dark:hover:text-white',
};

/**
 * Shared legal / company links for marketing and document footers.
 * @param {{ variant?: 'onDark' | 'onLight' | 'adaptive', className?: string }} props
 */
export default function SiteFooterLegal({ variant = 'onLight', className = '' }) {
  const linkClass = variants[variant] || variants.onLight;
  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-end ${className}`}
      aria-label="Contact, legal, and company"
    >
      <a
        href={`mailto:${SITE_CONTACT_EMAIL}`}
        className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50/90 px-2.5 py-1 text-sm font-semibold text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/40 dark:hover:text-white"
      >
        <FiMail className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden />
        <span className="min-w-0 break-all">{SITE_CONTACT_EMAIL}</span>
      </a>
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
