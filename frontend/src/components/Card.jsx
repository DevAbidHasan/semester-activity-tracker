export default function Card({ children, className = '', padding = 'p-6' }) {
  return (
    <div
      className={`rounded-2xl border border-white/40 bg-white/70 shadow-lg shadow-indigo-500/5 backdrop-blur-md transition hover:shadow-indigo-500/10 dark:border-slate-800/80 dark:bg-slate-900/60 ${padding} ${className}`}
    >
      {children}
    </div>
  );
}
