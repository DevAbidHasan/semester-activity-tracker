const variants = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-500 hover:to-violet-500',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
  danger: 'bg-rose-600 text-white hover:bg-rose-500',
  outline:
    'border border-slate-200 bg-white/80 text-slate-800 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
