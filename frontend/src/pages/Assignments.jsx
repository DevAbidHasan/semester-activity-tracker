import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { format } from 'date-fns';

const priorities = ['low', 'medium', 'high'];
const statuses = ['pending', 'submitted', 'graded', 'late'];

const emptyForm = {
  courseId: '',
  title: '',
  deadline: '',
  submissionStatus: 'pending',
  marksObtained: '',
  totalMarks: '',
  notes: '',
  priority: 'medium',
};

export default function Assignments() {
  const [rows, setRows] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const [aRes, cRes] = await Promise.all([
        api.get('/assignments', { params: { limit: 50, status: filter || undefined, sort: 'deadline', order: 'asc' } }),
        api.get('/courses', { params: { limit: 100 } }),
      ]);
      if (aRes.data.success) setRows(aRes.data.data);
      if (cRes.data.success) setCourses(cRes.data.data);
    } catch {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      courseId: String(row.courseId),
      title: row.title,
      deadline: row.deadline ? row.deadline.slice(0, 16) : '',
      submissionStatus: row.submissionStatus,
      marksObtained: row.marksObtained ?? '',
      totalMarks: row.totalMarks ?? '',
      notes: row.notes || '',
      priority: row.priority,
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      courseId: Number(form.courseId),
      title: form.title,
      deadline: new Date(form.deadline).toISOString(),
      submissionStatus: form.submissionStatus,
      marksObtained: form.marksObtained === '' ? null : Number(form.marksObtained),
      totalMarks: form.totalMarks === '' ? null : Number(form.totalMarks),
      notes: form.notes,
      priority: form.priority,
    };
    try {
      if (editing) await api.put(`/assignments/${editing.id}`, payload);
      else await api.post('/assignments', payload);
      toast.success('Saved');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`);
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
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Assignments</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Track deadlines, marks, and submission status.</p>
        </div>
        <Button onClick={openCreate}>
          <FiPlus /> Add assignment
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={filter === '' ? 'primary' : 'outline'} onClick={() => setFilter('')}>
          All
        </Button>
        {statuses.map((s) => (
          <Button key={s} variant={filter === s ? 'primary' : 'outline'} onClick={() => setFilter(s)}>
            {s}
          </Button>
        ))}
      </div>

      <Card padding="p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No assignments" description="Create one tied to a course." action={<Button onClick={openCreate}>Add</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900/60">
                <tr>
                  <th className="px-4 py-3">Assignment</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{r.title}</p>
                      <p className="text-xs capitalize text-slate-500">Priority: {r.priority}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">{r.courseCode}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {r.deadline ? format(new Date(r.deadline), 'MMM d, yyyy HH:mm') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold capitalize text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200">
                        {r.submissionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="mr-2 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => openEdit(r)}>
                        <FiEdit2 />
                      </button>
                      <button type="button" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40" onClick={() => remove(r.id)}>
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit assignment' : 'New assignment'} wide>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={save}>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500">Course</label>
            <select
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500">Title</label>
            <input
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500">Deadline</label>
            <input
              type="datetime-local"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Status</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.submissionStatus}
              onChange={(e) => setForm({ ...form, submissionStatus: e.target.value })}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Priority</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Marks obtained</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.marksObtained}
              onChange={(e) => setForm({ ...form, marksObtained: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Total marks</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.totalMarks}
              onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500">Notes</label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
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
