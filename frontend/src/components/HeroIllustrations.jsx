/**
 * Decorative hero illustrations — pointer-events none, hidden below lg to keep small layouts clear.
 */
const motionSafe = 'motion-reduce:animate-none motion-reduce:opacity-80';

function BookStackIllustration() {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M18 52V28l22-8 22 8v24"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-95"
      />
      <path d="M40 20v36" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="opacity-70" />
      <path
        d="M24 34h32M24 44h28M24 54h24"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="opacity-55"
      />
    </svg>
  );
}

function CalendarIllustration() {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="14" y="22" width="52" height="48" rx="8" stroke="currentColor" strokeWidth="2.2" className="opacity-90" />
      <path d="M14 34h52" stroke="currentColor" strokeWidth="2.2" className="opacity-80" />
      <path d="M28 18v12M52 18v12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="24" y="42" width="10" height="8" rx="1.5" fill="currentColor" className="opacity-35" />
      <rect x="38" y="42" width="10" height="8" rx="1.5" fill="currentColor" className="opacity-25" />
      <rect x="52" y="42" width="10" height="8" rx="1.5" fill="currentColor" className="opacity-45" />
    </svg>
  );
}

function ChartIllustration() {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M16 58h52M16 58V22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="opacity-75"
      />
      <path
        d="M24 50l12-18 10 10 14-28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-95"
      />
      <circle cx="24" cy="50" r="3" fill="currentColor" />
      <circle cx="36" cy="32" r="3" fill="currentColor" className="opacity-80" />
      <circle cx="46" cy="42" r="3" fill="currentColor" className="opacity-80" />
      <circle cx="60" cy="22" r="3" fill="currentColor" />
    </svg>
  );
}

function ChecklistIllustration() {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect
        x="22"
        y="18"
        width="36"
        height="48"
        rx="4"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
        className="opacity-85"
      />
      <path d="M30 32h22M30 44h18M30 56h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-45" />
      <path
        d="M26 30l4 4 8-10"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-95"
      />
      <path
        d="M26 42l4 4 8-10"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-55"
      />
    </svg>
  );
}

export default function HeroIllustrations() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-visible lg:block"
      aria-hidden
    >
      {/* Rounded “tile” — courses / books */}
      <div
        className={`absolute left-[2%] top-[6%] flex h-22 w-25 items-center justify-center rounded-[1.75rem] bg-linear-to-br from-indigo-500 to-violet-600 p-4 text-white shadow-xl shadow-indigo-500/35 ring-2 ring-white/25 dark:shadow-indigo-950/50 dark:ring-white/10 ${motionSafe} animate-hero-drift`}
      >
        <BookStackIllustration />
      </div>

      {/* Hexagon — schedule */}
      <div
        className={`absolute right-[3%] top-[10%] flex h-23 w-23 items-center justify-center bg-linear-to-br from-emerald-500 to-teal-600 p-3.5 text-white shadow-xl shadow-emerald-500/30 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] delay-700 dark:shadow-emerald-950/40 ${motionSafe} animate-hero-drift-reverse`}
      >
        <CalendarIllustration />
      </div>

      {/* Circle — progress / analytics */}
      <div
        className={`absolute bottom-[28%] left-[4%] flex h-19 w-19 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 p-3 text-white shadow-lg shadow-orange-500/35 ring-2 ring-white/30 delay-300 dark:from-amber-500 dark:to-orange-600 dark:shadow-orange-950/50 ${motionSafe} animate-hero-pulse-soft`}
      >
        <ChartIllustration />
      </div>

      {/* Skewed card — deadlines / tasks */}
      <div
        className={`absolute bottom-[22%] right-[2%] flex h-20 w-22 -skew-x-6 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500 to-fuchsia-600 p-3.5 text-white shadow-xl shadow-rose-500/30 delay-500 dark:shadow-fuchsia-950/40 ${motionSafe} animate-hero-drift-slow`}
      >
        <span className="skew-x-6">
          <ChecklistIllustration />
        </span>
      </div>
    </div>
  );
}
