import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

const emptyForm = {
  title: '',
  code: '',
  instructor: '',
  credit: 3,
  semesterId: '',
  semesterLabel: '',
  weeklyClassFrequency: 1,
  classDays: '',
  classStartTime: '',
  classEndTime: '',
  room: '',
  color: '#6366f1',
};

export default function Courses() {
  const [rows, setRows] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailsCourse, setDetailsCourse] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        api.get('/courses', { params: { page, limit: 10, search: search || undefined } }),
        api.get('/semesters'),
      ]);
      if (cRes.data.success) {
        setRows(cRes.data.data);
        setMeta(cRes.data.meta);
      }
      if (sRes.data.success) setSemesters(sRes.data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          err.friendlyMessage ||
          'Failed to load courses'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title,
      code: row.code,
      instructor: row.instructor || '',
      credit: row.credit,
      semesterId: row.semesterId || '',
      semesterLabel: row.semesterLabel || '',
      weeklyClassFrequency: row.weeklyClassFrequency,
      classDays: row.classDays || '',
      classStartTime: row.classStartTime?.slice(0, 5) || '',
      classEndTime: row.classEndTime?.slice(0, 5) || '',
      room: row.room || '',
      color: row.color,
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const wf = parseInt(String(form.weeklyClassFrequency), 10);
    const weeklyClassFrequency = Number.isFinite(wf) && wf >= 1 ? wf : 1;
    const cr = Number(form.credit);
    const credit = Number.isFinite(cr) && cr >= 0 ? cr : 3;
    const payload = {
      title: form.title.trim(),
      code: form.code.trim(),
      instructor: form.instructor.trim() || undefined,
      credit,
      semesterId: form.semesterId ? Number(form.semesterId) : null,
      semesterLabel: form.semesterLabel.trim() || undefined,
      weeklyClassFrequency,
      classDays: form.classDays.trim() || undefined,
      classStartTime: form.classStartTime || undefined,
      classEndTime: form.classEndTime || undefined,
      room: form.room.trim() || undefined,
      color: form.color || '#6366f1',
    };
    try {
      if (editing) {
        await api.put(`/courses/${editing.id}`, payload);
        toast.success('Course updated');
      } else {
        await api.post('/courses', payload);
        toast.success('Course added');
      }
      setModalOpen(false);
      load(meta.page);
    } catch (err) {
      const data = err.response?.data;
      const first =
        Array.isArray(data?.errors) && data.errors.length
          ? `${data.errors[0].msg} (${data.errors[0].path})`
          : null;
      toast.error(first || data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this course? Related assignments cascade.')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Deleted');
      load(meta.page);
    } catch {
      toast.error('Delete failed');
    }
  };

  const openDetails = (row) => setDetailsCourse(row);

  const onSearch = (e) => {
    e.preventDefault();
    load(1);
  };

  const colorSwatches = useMemo(
    () => ['#6366f1', '#ec4899', '#14b8a6', '#f97316', '#22c55e', '#eab308'],
    []
  );

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Courses</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Manage your semester lineup and metadata.</p>
        </div>
        <Button onClick={openCreate}>
          <FiPlus /> Add course
        </Button>
      </div>

      <form
        onSubmit={onSearch}
        className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-2"
      >
        <input
          placeholder="Search title, code, instructor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full min-w-0 flex-1 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
        />
        <Button type="submit" variant="outline" className="w-full shrink-0 sm:w-auto">
          Search
        </Button>
      </form>

      <Card padding="p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="Add your first course to unlock assignments, exams, and schedules."
            action={<Button onClick={openCreate}>Add course</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900/60">
                <tr>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Instructor</th>
                  <th className="px-4 py-3">Credits</th>
                  <th className="px-4 py-3">Schedule</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-900/40"
                    onClick={() => openDetails(r)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-9 w-1.5 rounded-full"
                          style={{ backgroundColor: r.color }}
                          aria-hidden
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{r.title}</p>
                          <p className="text-xs text-slate-500">{r.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.instructor || '—'}</td>
                    <td className="px-4 py-3">{r.credit}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                      {r.classDays || '—'}
                      {r.classStartTime && r.classEndTime && (
                        <span className="block text-slate-500">
                          {r.classStartTime?.slice(0, 5)} – {r.classEndTime?.slice(0, 5)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="mr-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(r);
                        }}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(r.id);
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {meta.pages > 1 && (
          <div className="flex justify-end gap-2 border-t border-slate-100 p-3 dark:border-slate-800">
            <Button
              variant="outline"
              disabled={meta.page <= 1}
              onClick={() => load(meta.page - 1)}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              disabled={meta.page >= meta.pages}
              onClick={() => load(meta.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(detailsCourse)}
        onClose={() => setDetailsCourse(null)}
        title="Course details"
        wide
      >
        {detailsCourse ? (
          <div className="space-y-6">
            <div
              className="h-1.5 w-full rounded-full"
              style={{ backgroundColor: detailsCourse.color || '#6366f1' }}
              aria-hidden
            />
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{detailsCourse.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{detailsCourse.code}</p>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Instructor</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{detailsCourse.instructor || '—'}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Credits</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{detailsCourse.credit}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Semester</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                  {detailsCourse.semesterName || detailsCourse.semesterLabel || '—'}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Weekly frequency</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                  {detailsCourse.weeklyClassFrequency || 0} class{detailsCourse.weeklyClassFrequency === 1 ? '' : 'es'}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/50 sm:col-span-2">
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Schedule</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                  {detailsCourse.classDays || '—'}
                  {detailsCourse.classStartTime && detailsCourse.classEndTime
                    ? ` • ${detailsCourse.classStartTime.slice(0, 5)} - ${detailsCourse.classEndTime.slice(0, 5)}`
                    : ''}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/50 sm:col-span-2">
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Room</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{detailsCourse.room || '—'}</dd>
              </div>
            </dl>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setDetailsCourse(null)}>
                Close
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const row = detailsCourse;
                  setDetailsCourse(null);
                  openEdit(row);
                }}
              >
                <FiEdit2 /> Edit
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit course' : 'New course'} wide>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={save}>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500">Title</label>
            <input
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Code</label>
            <input
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Credits</label>
            <input
              type="number"
              step="0.5"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.credit}
              onChange={(e) => setForm({ ...form, credit: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500">Instructor</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.instructor}
              onChange={(e) => setForm({ ...form, instructor: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Semester record</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.semesterId}
              onChange={(e) => setForm({ ...form, semesterId: e.target.value })}
            >
              <option value="">None</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Semester label</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.semesterLabel}
              onChange={(e) => setForm({ ...form, semesterLabel: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Weekly frequency</label>
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.weeklyClassFrequency}
              onChange={(e) => setForm({ ...form, weeklyClassFrequency: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Class days</label>
            <input
              placeholder="Mon, Wed, Fri"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.classDays}
              onChange={(e) => setForm({ ...form, classDays: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Start time</label>
            <input
              type="time"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.classStartTime}
              onChange={(e) => setForm({ ...form, classStartTime: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">End time</label>
            <input
              type="time"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.classEndTime}
              onChange={(e) => setForm({ ...form, classEndTime: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Room</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Tag color</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {colorSwatches.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 ${form.color === c ? 'border-slate-900 dark:border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setForm({ ...form, color: c })}
                />
              ))}
            </div>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
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
