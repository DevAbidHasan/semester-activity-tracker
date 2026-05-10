export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/40">
      {Icon && <Icon className="mb-4 h-12 w-12 text-indigo-400" />}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
