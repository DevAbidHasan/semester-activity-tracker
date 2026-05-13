import { IoClose } from 'react-icons/io5';

export default function Modal({ open, title, onClose, children, wide, size }) {
  if (!open) return null;
  const maxW =
    size === 'xl'
      ? 'max-w-4xl'
      : wide
        ? 'max-w-3xl'
        : 'max-w-lg';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        className={`relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-white/50 bg-white/95 p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900/95 ${maxW}`}
      >
        <div className={`mb-4 flex items-center gap-4 ${title ? 'justify-between' : 'justify-end'}`}>
          {title ? <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2> : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <IoClose className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
