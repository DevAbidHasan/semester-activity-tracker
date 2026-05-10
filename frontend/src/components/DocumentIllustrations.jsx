/** Inline SVGs for public document pages (About / Privacy / Terms). */

export function AboutIllustration({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="ab-grad" x1="40" y1="20" x2="280" y2="220" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="ab-card" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#334155" stopOpacity="0.9" />
          <stop offset="1" stopColor="#1e293b" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <rect x="24" y="32" width="272" height="176" rx="20" fill="url(#ab-card)" stroke="url(#ab-grad)" strokeWidth="1.5" strokeOpacity="0.5" />
      <circle cx="88" cy="96" r="28" fill="#6366f1" fillOpacity="0.35" />
      <path
        d="M76 96c0-6.6 5.4-12 12-12s12 5.4 12 12-5.4 12-12 12-12-5.4-12-12z"
        fill="#c7d2fe"
        fillOpacity="0.9"
      />
      <rect x="132" y="72" width="140" height="10" rx="5" fill="#94a3b8" fillOpacity="0.5" />
      <rect x="132" y="92" width="100" height="8" rx="4" fill="#64748b" fillOpacity="0.45" />
      <rect x="132" y="108" width="120" height="8" rx="4" fill="#64748b" fillOpacity="0.35" />
      <rect x="56" y="140" width="208" height="48" rx="12" fill="#4f46e5" fillOpacity="0.25" stroke="#818cf8" strokeOpacity="0.6" />
      <rect x="72" y="156" width="56" height="16" rx="4" fill="#e0e7ff" fillOpacity="0.35" />
      <rect x="140" y="156" width="40" height="16" rx="4" fill="#c7d2fe" fillOpacity="0.25" />
      <rect x="192" y="156" width="56" height="16" rx="4" fill="#a5b4fc" fillOpacity="0.3" />
      <path d="M248 48l24 16v112l-24 16V48z" fill="#312e81" fillOpacity="0.6" />
      <path d="M248 48l-20 12v128l20 12" stroke="url(#ab-grad)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PrivacyIllustration({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="pv-shield" x1="160" y1="40" x2="160" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="pv-bg" x1="0" y1="0" x2="320" y2="240">
          <stop stopColor="#0f172a" />
          <stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>
      </defs>
      <rect width="320" height="240" rx="24" fill="url(#pv-bg)" fillOpacity="0.4" />
      <path
        d="M160 36L88 68v84c0 48 32 88 72 100 40-12 72-52 72-100V68L160 36z"
        fill="#1e293b"
        stroke="url(#pv-shield)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M128 118l20 20 44-52"
        stroke="url(#pv-shield)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="248" cy="64" r="8" fill="#22d3ee" fillOpacity="0.5" />
      <circle cx="72" cy="180" r="12" fill="#6366f1" fillOpacity="0.25" />
    </svg>
  );
}

export function TermsIllustration({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="tm-bar" x1="72" y1="0" x2="248" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f472b6" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect x="48" y="36" width="224" height="168" rx="16" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
      <rect x="48" y="36" width="224" height="36" rx="16" fill="#334155" />
      <rect x="48" y="60" width="224" height="12" fill="#334155" />
      <rect x="64" y="46" width="96" height="8" rx="4" fill="url(#tm-bar)" fillOpacity="0.85" />
      <rect x="64" y="96" width="192" height="6" rx="3" fill="#64748b" fillOpacity="0.5" />
      <rect x="64" y="112" width="160" height="6" rx="3" fill="#64748b" fillOpacity="0.4" />
      <rect x="64" y="128" width="176" height="6" rx="3" fill="#64748b" fillOpacity="0.35" />
      <rect x="64" y="152" width="88" height="36" rx="8" fill="#4c1d95" fillOpacity="0.45" stroke="#a78bfa" strokeOpacity="0.5" />
      <rect x="168" y="152" width="88" height="36" rx="8" fill="#831843" fillOpacity="0.35" stroke="#f472b6" strokeOpacity="0.4" />
      <path d="M108 170h24M188 170h24" stroke="#e2e8f0" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
      <circle cx="260" cy="188" r="28" fill="#312e81" fillOpacity="0.5" stroke="#818cf8" strokeOpacity="0.6" />
      <path d="M252 188h16M260 180v16" stroke="#c7d2fe" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
