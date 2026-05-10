import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { compareAsc, compareDesc, format, isBefore, parseISO, startOfDay } from 'date-fns';

const emptyForm = {
  courseId: '',
  title: '',
  examType: 'midterm',
  examDate: '',
  marks: '',
  notes: '',
};

export default function Exams() {
  const [rows, setRows] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filterCourseId, setFilterCourseId] = useState('');
  const [examRefresh, setExamRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [detailExam, setDetailExam] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCoursesLoading(true);
      try {
        const cRes = await api.get('/courses', { params: { limit: 200, page: 1 } });
        if (!cancelled && cRes.data.success) setCourses(cRes.data.data);
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err.response?.data?.message ||
              err.response?.data?.errors?.[0]?.msg ||
              err.friendlyMessage ||
              'Failed to load courses'
          );
        }
      } finally {
        if (!cancelled) setCoursesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = { limit: 50, sort: 'exam_date', order: 'asc', page: 1 };
        if (filterCourseId) params.courseId = Number(filterCourseId);
        const eRes = await api.get('/exams', { params });
        if (!cancelled && eRes.data.success) setRows(eRes.data.data);
      } catch {
        if (!cancelled) toast.error('Failed to load exams');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filterCourseId, examRefresh]);

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
      gpaGrade: null,
      notes: form.notes,
    };
    try {
      if (editing) await api.put(`/exams/${editing.id}`, payload);
      else await api.post('/exams', payload);
      toast.success('Saved');
      setModalOpen(false);
      setExamRefresh((n) => n + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const { upcomingExams, pastExams } = useMemo(() => {
    const today = startOfDay(new Date());
    const upcoming = [];
    const past = [];
    for (const r of rows) {
      if (!r.examDate) {
        upcoming.push(r);
        continue;
      }
      const d = startOfDay(parseISO(String(r.examDate).slice(0, 10)));
      if (isBefore(d, today)) past.push(r);
      else upcoming.push(r);
    }
    upcoming.sort((a, b) => {
      if (!a.examDate) return 1;
      if (!b.examDate) return -1;
      return compareAsc(parseISO(a.examDate.slice(0, 10)), parseISO(b.examDate.slice(0, 10)));
    });
    past.sort((a, b) => {
      if (!a.examDate) return 1;
      if (!b.examDate) return -1;
      return compareDesc(parseISO(a.examDate.slice(0, 10)), parseISO(b.examDate.slice(0, 10)));
    });
    return { upcomingExams: upcoming, pastExams: past };
  }, [rows]);

  const remove = async (id) => {
    if (!confirm('Delete exam?')) return;
    try {
      await api.delete(`/exams/${id}`);
      toast.success('Deleted');
      setDetailExam((d) => (d && d.id === id ? null : d));
      setExamRefresh((n) => n + 1);
    } catch {
      toast.error('Delete failed');
    }
  };

  const examTiming = (row) => {
    if (!row.examDate) return { label: 'Date not set', tone: 'slate' };
    const d = startOfDay(parseISO(String(row.examDate).slice(0, 10)));
    const today = startOfDay(new Date());
    if (isBefore(d, today)) return { label: 'Past exam', tone: 'emerald' };
    return { label: 'Upcoming', tone: 'rose' };
  };

  const openDetail = (row) => setDetailExam(row);

  const closeDetail = () => setDetailExam(null);

  const editFromDetail = (row) => {
    closeDetail();
    openEdit(row);
  };

  const rowUpcoming =
    'bg-red-50 hover:bg-red-100/90 dark:bg-red-950/30 dark:hover:bg-red-950/45 [&_button:hover]:bg-red-100/80 dark:[&_button:hover]:bg-red-900/40';
  const rowPast =
    'bg-green-50 hover:bg-green-100/90 dark:bg-green-950/25 dark:hover:bg-green-950/40 [&_button:hover]:bg-green-100/80 dark:[&_button:hover]:bg-green-900/35';

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <div className="min-w-0 shrink-0">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Exams</h1>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end sm:gap-3">
          <div className="min-w-0 w-full sm:max-w-md sm:flex-1 lg:max-w-lg">
            <label htmlFor="exam-course-filter" className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Course
            </label>
            <select
              id="exam-course-filter"
              disabled={coursesLoading}
              className="mt-1 w-full max-w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
              value={filterCourseId}
              onChange={(e) => setFilterCourseId(e.target.value)}
            >
              <option value="">All courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end sm:gap-2">
            {filterCourseId ? (
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setFilterCourseId('')}>
                Clear filter
              </Button>
            ) : null}
            <Button className="w-full sm:w-auto" onClick={openCreate}>
              <FiPlus /> Add exam
            </Button>
          </div>
        </div>
      </div>

      <Card padding="p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title={filterCourseId ? 'No exams for this course' : 'No exams'}
            description={
              filterCourseId
                ? 'Try another course or clear the filter to see all exams.'
                : 'Add midterms, finals, or quizzes.'
            }
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {filterCourseId ? (
                  <Button type="button" variant="outline" onClick={() => setFilterCourseId('')}>
                    Show all courses
                  </Button>
                ) : null}
                <Button onClick={openCreate}>Add exam</Button>
              </div>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50/90 text-left text-xs font-medium text-slate-500 dark:bg-slate-900/70">
                <tr>
                  <th className="px-4 py-3 font-medium">Exam</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Marks</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {upcomingExams.map((r) => (
                  <tr
                    key={r.id}
                    className={`${rowUpcoming} cursor-pointer`}
                    onClick={() => openDetail(r)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{r.title}</p>
                      <p className="text-xs capitalize text-slate-500">{r.examType}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{r.courseCode}</td>
                    <td className="px-4 py-3">{r.examDate ? format(new Date(r.examDate), 'MMM d, yyyy') : '—'}</td>
                    <td className="px-4 py-3 tabular-nums">{r.marks != null ? r.marks : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="mr-2 rounded-lg p-2"
                        aria-label="Edit exam"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(r);
                        }}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-rose-600 dark:text-rose-400"
                        aria-label="Delete exam"
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
                {pastExams.map((r) => (
                  <tr
                    key={r.id}
                    className={`${rowPast} cursor-pointer`}
                    onClick={() => openDetail(r)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{r.title}</p>
                      <p className="text-xs capitalize text-slate-500">{r.examType}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{r.courseCode}</td>
                    <td className="px-4 py-3">{r.examDate ? format(new Date(r.examDate), 'MMM d, yyyy') : '—'}</td>
                    <td className="px-4 py-3 tabular-nums">{r.marks != null ? r.marks : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="mr-2 rounded-lg p-2"
                        aria-label="Edit exam"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(r);
                        }}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-rose-600 dark:text-rose-400"
                        aria-label="Delete exam"
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
      </Card>

      <Modal open={Boolean(detailExam)} onClose={closeDetail} title="Exam details" wide>
        {detailExam && (
          <div className="space-y-6">
            <div
              className="h-1.5 w-full rounded-full"
              style={{
                backgroundColor: detailExam.courseColor || '#6366f1',
              }}
              aria-hidden
            />
            <div className="flex flex-wrap items-center gap-2">
              {(() => {
                const t = examTiming(detailExam);
                const tone =
                  t.tone === 'emerald'
                    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : t.tone === 'rose'
                      ? 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                return (
                  <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${tone}`}>{t.label}</span>
                );
              })()}
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {detailExam.examType}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{detailExam.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {(detailExam.courseCode || '—') + (detailExam.courseTitle ? ` · ${detailExam.courseTitle}` : '')}
              </p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Exam date</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {detailExam.examDate
                    ? format(parseISO(String(detailExam.examDate).slice(0, 10)), 'EEEE, MMMM d, yyyy')
                    : 'Not scheduled'}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Marks (your record)</dt>
                <dd className="mt-1 text-sm font-medium tabular-nums text-slate-900 dark:text-white">
                  {detailExam.marks != null ? detailExam.marks : '—'}
                </dd>
              </div>
            </dl>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Notes &amp; syllabus
              </h4>
              <div className="mt-2 min-h-16 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                {detailExam.notes?.trim()
                  ? detailExam.notes.trim()
                  : 'No notes or syllabus saved. Use Edit to add topics, chapters, links, or a study plan.'}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={closeDetail}>
                Close
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  editFromDetail(detailExam);
                }}
              >
                <FiEdit2 /> Edit exam
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500">Marks (your record)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={form.marks}
              onChange={(e) => setForm({ ...form, marks: e.target.value })}
              placeholder="e.g. 85"
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
