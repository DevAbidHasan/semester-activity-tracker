import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const emptyForm = {
  courseId: '',
  dayOfWeek: 'monday',
  startTime: '09:00',
  durationMinutes: 60,
  room: '',
  teacher: '',
};

export default function Schedule() {
  const [rows, setRows] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([
        api.get('/schedules'),
        api.get('/courses', { params: { limit: 100 } }),
      ]);
      if (sRes.data.success) setRows(sRes.data.data);
      if (cRes.data.success) setCourses(cRes.data.data);
    } catch {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const byDay = useMemo(() => {
    const map = Object.fromEntries(days.map((d) => [d, []]));
    rows.forEach((r) => {
      map[r.dayOfWeek]?.push(r);
    });
    return map;
  }, [rows]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      courseId: String(row.courseId),
      dayOfWeek: row.dayOfWeek,
      startTime: row.startTime?.slice(0, 5) || '09:00',
      durationMinutes: row.durationMinutes,
      room: row.room || '',
      teacher: row.teacher || '',
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      courseId: Number(form.courseId),
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime,
      durationMinutes: Number(form.durationMinutes),
      room: form.room,
      teacher: form.teacher,
    };
    try {
      if (editing) await api.put(`/schedules/${editing.id}`, payload);
      else await api.post('/schedules', payload);
      toast.success('Saved');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Remove this block?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      toast.success('Removed');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Weekly schedule</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Calendar-style overview of recurring classes.</p>
        </div>
        <Button onClick={openCreate}>
          <FiPlus /> Add block
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="No schedule entries" description="Link each block to a course, day, and time." action={<Button onClick={openCreate}>Add block</Button>} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-7">
          {days.map((d) => (
            <Card key={d} className="min-h-[220px]" padding="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{d}</p>
              <div className="mt-3 space-y-3">
                {byDay[d].map((b) => (
                  <div
                    key={b.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{b.courseCode}</p>
                        <p className="text-slate-600 dark:text-slate-300">{b.startTime?.slice(0, 5)} · {b.durationMinutes}m</p>
                        <p className="text-slate-500">{b.room || 'Room TBD'}</p>
                      </div>
                      <div className="flex gap-1">
                        <button type="button" className="rounded p-1 hover:bg-white dark:hover:bg-slate-800" onClick={() => openEdit(b)}>
                          <FiEdit2 />
                        </button>
                        <button type="button" className="rounded p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40" onClick={() => remove(b.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                    <span className="mt-2 inline-block h-1 w-full rounded-full" style={{ backgroundColor: b.courseColor || '#6366f1' }} />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">List view</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Day</th>
                <th className="py-2">Course</th>
                <th className="py-2">Time</th>
                <th className="py-2">Room</th>
                <th className="py-2">Teacher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 capitalize">{r.dayOfWeek}</td>
                  <td className="py-2">{r.courseTitle}</td>
                  <td className="py-2">
                    {r.startTime?.slice(0, 5)} ({r.durationMinutes}m)
                  </td>
                  <td className="py-2">{r.room || '—'}</td>
                  <td className="py-2">{r.teacher || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit block' : 'New block'}>
        <form className="space-y-4" onSubmit={save}>
          <div>
            <label className="text-xs font-semibold text-slate-500">Course</label>
            <select
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
            >
              <option value="">Select</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Day</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.dayOfWeek}
              onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500">Start</label>
              <input
                type="time"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Minutes</label>
              <input
                type="number"
                min={15}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
              />
            </div>
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
            <label className="text-xs font-semibold text-slate-500">Teacher</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.teacher}
              onChange={(e) => setForm({ ...form, teacher: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
