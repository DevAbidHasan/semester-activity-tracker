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

const emptyForm = {
  courseId: '',
  title: '',
  examType: 'midterm',
  examDate: '',
  marks: '',
  gpaGrade: '',
  notes: '',
};

export default function Exams() {
  const [rows, setRows] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const [eRes, cRes] = await Promise.all([
        api.get('/exams', { params: { limit: 50, sort: 'exam_date', order: 'asc' } }),
        api.get('/courses', { params: { limit: 100 } }),
      ]);
      if (eRes.data.success) setRows(eRes.data.data);
      if (cRes.data.success) setCourses(cRes.data.data);
    } catch {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
      examType: row.examType,
      examDate: row.examDate ? row.examDate.slice(0, 10) : '',
      marks: row.marks ?? '',
      gpaGrade: row.gpaGrade || '',
      notes: row.notes || '',
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      courseId: Number(form.courseId),
      title: form.title,
      examType: form.examType,
      examDate: form.examDate,
      marks: form.marks === '' ? null : Number(form.marks),
      gpaGrade: form.gpaGrade || null,
      notes: form.notes,
    };
    try {
      if (editing) await api.put(`/exams/${editing.id}`, payload);
      else await api.post('/exams', payload);
      toast.success('Saved');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete exam?')) return;
    try {
      await api.delete(`/exams/${id}`);
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
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Exams</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Plan assessments and capture outcomes.</p>
        </div>
        <Button onClick={openCreate}>
          <FiPlus /> Add exam
        </Button>
      </div>

      <Card padding="p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No exams" description="Add midterms, finals, or quizzes." action={<Button onClick={openCreate}>Add exam</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900/60">
                <tr>
                  <th className="px-4 py-3">Exam</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{r.title}</p>
                      <p className="text-xs capitalize text-slate-500">{r.examType}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{r.courseCode}</td>
                    <td className="px-4 py-3">{r.examDate ? format(new Date(r.examDate), 'MMM d, yyyy') : '—'}</td>
                    <td className="px-4 py-3">
                      {r.gpaGrade || '—'}
                      {r.marks != null && <span className="ml-2 text-xs text-slate-500">({r.marks})</span>}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit exam' : 'New exam'} wide>
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
          <div>
            <label className="text-xs font-semibold text-slate-500">Type</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.examType}
              onChange={(e) => setForm({ ...form, examType: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Date</label>
            <input
              type="date"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Marks</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.marks}
              onChange={(e) => setForm({ ...form, marks: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">GPA / grade</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.gpaGrade}
              onChange={(e) => setForm({ ...form, gpaGrade: e.target.value })}
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
