import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { format, isValid, parseISO } from 'date-fns';
import { FiEdit2, FiExternalLink, FiLink, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

const PRIORITIES = [
  { value: 'urgent', label: 'Urgent', hint: 'Time-sensitive' },
  { value: 'medium', label: 'Medium', hint: 'Soon' },
  { value: 'normal', label: 'Normal', hint: 'Whenever' },
];

const PRIORITY_VALUES = new Set(PRIORITIES.map((p) => p.value));

function categorySelectOptions(extraFromApi) {
  const seen = new Set(PRIORITIES.map((p) => p.value));
  const extras = (extraFromApi || []).filter((c) => {
    if (!c || seen.has(String(c).toLowerCase())) return false;
    seen.add(String(c).toLowerCase());
    return true;
  });
  return [
    ...PRIORITIES.map((p) => ({ value: p.value, label: `${p.label} — ${p.hint}` })),
    ...extras.map((c) => ({ value: c, label: `${c} (custom)` })),
  ];
}

const emptyForm = { title: '', content: '', category: 'normal', linkUrl: '' };

function priorityMeta(value) {
  const v = (value || '').toLowerCase();
  return PRIORITIES.find((p) => p.value === v) || { value: 'custom', label: value || 'Uncategorized', hint: '' };
}

function priorityStyles(value) {
  const v = (value || '').toLowerCase();
  if (v === 'urgent')
    return {
      bar: 'bg-rose-500',
      ring: 'ring-rose-500/25',
      badge: 'bg-rose-500/12 text-rose-800 ring-1 ring-rose-500/30 dark:text-rose-200',
      glow: 'shadow-rose-500/10',
    };
  if (v === 'medium')
    return {
      bar: 'bg-amber-500',
      ring: 'ring-amber-500/25',
      badge: 'bg-amber-500/12 text-amber-900 ring-1 ring-amber-500/30 dark:text-amber-100',
      glow: 'shadow-amber-500/10',
    };
  return {
    bar: 'bg-emerald-500',
    ring: 'ring-emerald-500/20',
    badge: 'bg-slate-500/10 text-slate-700 ring-1 ring-slate-400/25 dark:text-slate-200',
    glow: 'shadow-emerald-500/5',
  };
}

export default function Notes() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailNote, setDetailNote] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filterOptions = useMemo(() => {
    const preset = PRIORITIES.map((p) => p.value);
    const extra = (categories || []).filter((c) => c && !preset.includes(String(c).toLowerCase()));
    return [...preset, ...extra];
  }, [categories]);

  const load = async () => {
    setLoading(true);
    try {
      const [nRes, cRes] = await Promise.all([
        api.get('/notes', { params: { q: q || undefined, category: category || undefined, limit: 50 } }),
        api.get('/notes/categories'),
      ]);
      if (nRes.data.success) setRows(nRes.data.data);
      if (cRes.data.success) setCategories(cRes.data.data);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const search = (e) => {
    e.preventDefault();
    load();
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = async (row) => {
    try {
      const { data } = await api.get(`/notes/${row.id}`);
      if (!data.success) return;
      setEditing(data.data);
      setForm({
        title: data.data.title,
        content: data.data.content,
        category: (() => {
          const c = (data.data.category || 'normal').trim();
          if (!c) return 'normal';
          if (PRIORITY_VALUES.has(c.toLowerCase())) return c.toLowerCase();
          return c;
        })(),
        linkUrl: data.data.linkUrl || '',
      });
      setFormOpen(true);
    } catch {
      toast.error('Could not load note');
    }
  };

  const openDetail = async (row) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailNote(null);
    try {
      const { data } = await api.get(`/notes/${row.id}`);
      if (data.success) setDetailNote(data.data);
    } catch {
      toast.error('Could not load note');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content,
        category: form.category || 'normal',
        linkUrl: form.linkUrl.trim() || undefined,
      };
      if (editing) await api.put(`/notes/${editing.id}`, payload);
      else await api.post('/notes', payload);
      toast.success('Saved');
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      toast.success('Deleted');
      setDetailOpen(false);
      setDetailNote(null);
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    const p = parseISO(String(d).slice(0, 19));
    return isValid(p) ? format(p, 'PPp') : '—';
  };

  return (
    <div className="w-full min-w-0 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Notes</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Capture ideas with priority, optional links, and search. Click any card to read the full note.
          </p>
        </div>
        <Button onClick={openCreate} className="w-full shrink-0 sm:w-auto">
          <FiPlus className="h-4 w-4" aria-hidden /> New note
        </Button>
      </div>

      <form
        onSubmit={search}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/40 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <div className="relative min-w-0 flex-1 sm:min-w-[12rem]">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-10 pr-3 text-sm shadow-inner shadow-slate-900/5 outline-none ring-indigo-500/0 transition focus:border-indigo-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-900/80 dark:focus:border-indigo-500"
            placeholder="Search title or description…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm shadow-inner dark:border-slate-600 dark:bg-slate-900/80 sm:w-48"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All priorities</option>
          {filterOptions.map((c) => (
            <option key={c} value={c}>
              {priorityMeta(c).label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" className="w-full sm:w-auto">
          Search
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No notes yet"
          description="Create your first note with a priority and optional link."
          action={
            <Button onClick={openCreate}>
              <FiPlus className="h-4 w-4" aria-hidden /> Add note
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((n) => {
            const st = priorityStyles(n.category);
            const pm = priorityMeta(n.category);
            const excerpt = n.excerpt ? String(n.excerpt).trimEnd() : '';
            const excerptSuffix = excerpt.length >= 200 ? '…' : '';
            return (
              <li key={n.id} className="group relative min-h-0">
                <div
                  className={`relative flex min-h-[11rem] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 p-5 shadow-md shadow-slate-900/5 ring-1 ring-transparent transition hover:-translate-y-0.5 hover:border-indigo-300/60 hover:shadow-lg hover:shadow-indigo-500/10 hover:ring-indigo-500/15 dark:border-slate-700/90 dark:from-slate-900/90 dark:to-slate-950/80 dark:hover:border-indigo-500/40 ${st.glow}`}
                >
                  <button
                    type="button"
                    className="absolute inset-0 z-0 rounded-2xl"
                    onClick={() => openDetail(n)}
                    aria-label={`Open note: ${n.title}`}
                  />
                  <span className={`pointer-events-none absolute left-0 top-5 z-[1] h-10 w-1 rounded-r-full ${st.bar}`} aria-hidden />
                  <div className="relative z-[1] flex items-start justify-between gap-2 pl-2">
                    <span
                      className={`pointer-events-none inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${st.badge}`}
                    >
                      {pm.label}
                    </span>
                    <div className="flex shrink-0 gap-0.5">
                      <button
                        type="button"
                        className="relative z-[2] rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(n);
                        }}
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="relative z-[2] rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(n.id);
                        }}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h2 className="pointer-events-none relative z-[1] mt-3 line-clamp-2 pl-2 text-base font-semibold text-slate-900 dark:text-white">
                    {n.title}
                  </h2>
                  <p className="pointer-events-none relative z-[1] mt-2 line-clamp-3 flex-1 pl-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {excerpt}
                    {excerptSuffix}
                  </p>
                  <div className="pointer-events-none relative z-[1] mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 pl-2 dark:border-slate-800">
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      {n.updatedAt ? format(parseISO(String(n.updatedAt).slice(0, 10)), 'MMM d, yyyy') : ''}
                    </span>
                    {n.linkUrl ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        <FiLink className="h-3.5 w-3.5" aria-hidden />
                        Link
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Tap to open</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="" size="xl">
        {detailLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : detailNote ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${priorityStyles(detailNote.category).badge}`}
                >
                  {priorityMeta(detailNote.category).label}
                </span>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{detailNote.title}</h2>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Updated {fmtDate(detailNote.updatedAt)}
                  {detailNote.createdAt && detailNote.createdAt !== detailNote.updatedAt && (
                    <> · Created {fmtDate(detailNote.createdAt)}</>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDetailOpen(false);
                    openEdit(detailNote);
                  }}
                >
                  <FiEdit2 className="h-4 w-4" /> Edit
                </Button>
                <Button type="button" variant="danger" onClick={() => remove(detailNote.id)}>
                  <FiTrash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</h3>
              <div className="mt-2 max-h-[min(50vh,28rem)] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-4 text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200">
                <p className="whitespace-pre-wrap break-words">{detailNote.content}</p>
              </div>
            </div>
            {detailNote.linkUrl ? (
              <div className="rounded-xl border border-indigo-200/70 bg-indigo-50/50 p-4 dark:border-indigo-500/30 dark:bg-indigo-950/30">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-200">Link</h3>
                <a
                  href={detailNote.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex max-w-full items-center gap-2 break-all text-sm font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-300"
                >
                  {detailNote.linkUrl}
                  <FiExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                </a>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit note' : 'New note'} wide>
        <form className="space-y-5" onSubmit={save}>
          <div>
            <label htmlFor="note-title" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Title
            </label>
            <input
              id="note-title"
              required
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-inner outline-none ring-indigo-500/0 transition focus:border-indigo-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-900/80"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Short headline"
            />
          </div>
          <div>
            <label htmlFor="note-priority" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Priority
            </label>
            <select
              id="note-priority"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900/80"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categorySelectOptions(categories).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="note-link" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Link <span className="font-normal normal-case text-slate-400">(optional)</span>
            </label>
            <input
              id="note-link"
              type="url"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900/80"
              value={form.linkUrl}
              onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <div>
            <label htmlFor="note-desc" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Description
            </label>
            <textarea
              id="note-desc"
              required
              rows={8}
              className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed dark:border-slate-600 dark:bg-slate-900/80"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write the full note…"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
