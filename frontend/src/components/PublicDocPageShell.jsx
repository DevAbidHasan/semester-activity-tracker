/**
 * Shared hero + content card for About, Privacy, and Terms.
 */
export default function PublicDocPageShell({ eyebrow, title, subtitle, illustration: Illustration, children }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -right-20 -top-10 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl dark:bg-indigo-400/10" />
      <div className="pointer-events-none absolute -left-16 top-40 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-400/10" />

      <header className="relative mt-8 flex flex-col gap-10 lg:mt-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="max-w-xl flex-1">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        {Illustration ? (
          <div className="relative mx-auto w-full max-w-[min(100%,280px)] shrink-0 lg:mx-0">
            <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-4 shadow-lg shadow-indigo-500/5 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/40 dark:shadow-indigo-950/20">
              <Illustration className="h-auto w-full" />
            </div>
          </div>
        ) : null}
      </header>

      <div className="relative mt-10 rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-md sm:p-8 lg:p-10 dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/40">
        <div className="max-w-none [&_article]:max-w-none">{children}</div>
      </div>
    </div>
  );
}
