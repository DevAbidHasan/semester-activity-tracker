import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

const emptyForm = { title: '', content: '', category: '' };

export default function Notes() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const [nRes, cRes] = await Promise.all([
        api.get('/notes', { params: { q: q || undefined, category: category || undefined, limit: 30 } }),
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
    setModalOpen(true);
  };

  const openEdit = async (row) => {
    try {
      const { data } = await api.get(`/notes/${row.id}`);
      if (!data.success) return;
      setEditing(data.data);
      setForm({ title: data.data.title, content: data.data.content, category: data.data.category || '' });
      setModalOpen(true);
    } catch {
      toast.error('Could not load note');
    }
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/notes/${editing.id}`, form);
      else await api.post('/notes', form);
      toast.success('Saved');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Notes</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Capture ideas with categories and instant search.</p>
        </div>
        <Button onClick={openCreate}>
          <FiPlus /> New note
        </Button>
      </div>

      <form onSubmit={search} className="flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white/90 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900/80"
            placeholder="Search title or body…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <Card padding="p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No notes yet" description="Create searchable study snippets." action={<Button onClick={openCreate}>Add note</Button>} />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((n) => (
              <li key={n.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{n.excerpt}…</p>
                  <p className="mt-1 text-xs text-slate-500">{n.category || 'Uncategorized'}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => openEdit(n)}>
                    <FiEdit2 />
                  </button>
                  <button type="button" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40" onClick={() => remove(n.id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit note' : 'New note'} wide>
        <form className="space-y-4" onSubmit={save}>
          <div>
            <label className="text-xs font-semibold text-slate-500">Title</label>
            <input
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Category</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Content</label>
            <textarea
              required
              rows={8}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
