import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format, isValid, parseISO } from 'date-fns';
import { FiBarChart2, FiBook, FiCalendar, FiClipboard, FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import { STUDENT_BASE } from '../layouts/StudentLayout';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excused' },
];

const emptySemesterForm = {
  name: '',
  academicYear: '',
  startDate: '',
  endDate: '',
  isCurrent: true,
};

function formatSemesterRange(startDate, endDate) {
  const tryFmt = (d) => {
    if (!d) return null;
    const p = parseISO(String(d).slice(0, 10));
    return isValid(p) ? format(p, 'MMM d, yyyy') : null;
  };
  const a = tryFmt(startDate);
  const b = tryFmt(endDate);
  if (a && b) return `${a} – ${b}`;
  if (a) return `Starts ${a}`;
  if (b) return `Ends ${b}`;
  return null;
}

export default function SemesterTracker() {
  const [stats, setStats] = useState(null);
  const [att, setAtt] = useState(null);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [semesterSaving, setSemesterSaving] = useState(false);
  const [newSemester, setNewSemester] = useState(emptySemesterForm);
  const [plannedCredits, setPlannedCredits] = useState('');
  const [attForm, setAttForm] = useState({
    courseId: '',
    sessionDate: new Date().toISOString().slice(0, 10),
    status: 'present',
  });

  const load = async ({ silent } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const [d, a, c, s] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/attendance/summary'),
        api.get('/courses', { params: { limit: 100, page: 1 } }),
        api.get('/semesters'),
      ]);
      if (d.data.success) setStats(d.data.data);
      if (a.data.success) setAtt(a.data.data);
      if (c.data.success) setCourses(c.data.data);
      if (s.data.success) setSemesters(s.data.data);
    } catch {
      toast.error('Failed to load tracker data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const registeredCredits = stats?.credits?.total ?? 0;
  const plannedNum = plannedCredits === '' ? null : Number(plannedCredits);
  const plannedValid = plannedNum != null && Number.isFinite(plannedNum) && plannedNum >= 0;
  const creditDelta = plannedValid ? plannedNum - registeredCredits : null;

  const assignmentTotal = stats?.assignments?.total ?? 0;
  const assignmentDone = stats?.assignments?.completed ?? 0;
  const assignmentBarPct = assignmentTotal > 0 ? Math.round((assignmentDone / assignmentTotal) * 100) : 0;

  const semesterPct = useMemo(() => {
    const p = stats?.semesterProgressPercent;
    if (p == null || !Number.isFinite(Number(p))) return null;
    return Math.min(100, Math.max(0, Number(p)));
  }, [stats?.semesterProgressPercent]);

  const setCurrentSemester = async (id) => {
    setSemesterSaving(true);
    try {
      await api.put(`/semesters/${id}`, { isCurrent: true });
      toast.success('Current semester updated');
      await load({ silent: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update semester');
    } finally {
      setSemesterSaving(false);
    }
  };

  const createSemester = async (e) => {
    e.preventDefault();
    const name = newSemester.name.trim();
    if (!name) {
      toast.error('Enter a semester name');
      return;
    }
    setSemesterSaving(true);
    try {
      await api.post('/semesters', {
        name,
        academicYear: newSemester.academicYear.trim() || undefined,
        startDate: newSemester.startDate || undefined,
        endDate: newSemester.endDate || undefined,
        isCurrent: newSemester.isCurrent,
      });
      toast.success('Semester added');
      setNewSemester({ ...emptySemesterForm, isCurrent: false });
      await load({ silent: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create semester');
    } finally {
      setSemesterSaving(false);
    }
  };

  const logAttendance = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance', {
        courseId: Number(attForm.courseId),
        sessionDate: attForm.sessionDate,
        status: attForm.status,
      });
      toast.success('Session saved');
      load({ silent: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const hasCourses = courses.length > 0;

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Semester</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Progress, assignments, attendance, and a quick credit check—all in one place.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full shrink-0 sm:w-auto"
          disabled={refreshing}
          onClick={() => load({ silent: true })}
        >
          <FiRefreshCw className={refreshing ? 'animate-spin' : ''} aria-hidden />
          Refresh
        </Button>
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
            <FiBook className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Current semester</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Timeline progress uses the term marked <span className="font-medium text-slate-800 dark:text-slate-200">current</span> here.
              You can attach courses to a term from{' '}
              <Link to={`${STUDENT_BASE}/courses`} className="font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400">
                Courses
              </Link>{' '}
              (semester field)—that is separate from which term is &quot;current&quot; for the dashboard.
            </p>
          </div>
        </div>

        {semesters.length > 0 ? (
          <ul className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
            {semesters.map((sem) => {
              const range = formatSemesterRange(sem.startDate, sem.endDate);
              return (
                <li
                  key={sem.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-white">{sem.name}</p>
                      {sem.isCurrent && (
                        <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-200">
                          Current
                        </span>
                      )}
                    </div>
                    {sem.academicYear && (
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sem.academicYear}</p>
                    )}
                    {range && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{range}</p>}
                  </div>
                  {!sem.isCurrent && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full shrink-0 sm:w-auto"
                      disabled={semesterSaving}
                      onClick={() => setCurrentSemester(sem.id)}
                    >
                      Set as current
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200">
            No semesters yet. Add one below—check &quot;Make this my current semester&quot; so the timeline can
            compute progress from its dates.
          </p>
        )}

        <form className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800" onSubmit={createSemester}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Add a semester</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="sem-name" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Name <span className="text-rose-600">*</span>
              </label>
              <input
                id="sem-name"
                required
                placeholder="e.g. Fall 2026"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900/80"
                value={newSemester.name}
                onChange={(e) => setNewSemester({ ...newSemester, name: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="sem-year" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Academic year (optional)
              </label>
              <input
                id="sem-year"
                placeholder="e.g. 2026–2027"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900/80"
                value={newSemester.academicYear}
                onChange={(e) => setNewSemester({ ...newSemester, academicYear: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="sem-start" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Start date
              </label>
              <input
                id="sem-start"
                type="date"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900/80"
                value={newSemester.startDate}
                onChange={(e) => setNewSemester({ ...newSemester, startDate: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="sem-end" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                End date
              </label>
              <input
                id="sem-end"
                type="date"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900/80"
                value={newSemester.endDate}
                onChange={(e) => setNewSemester({ ...newSemester, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="sem-current"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
                checked={newSemester.isCurrent}
                onChange={(e) => setNewSemester({ ...newSemester, isCurrent: e.target.checked })}
              />
              <label htmlFor="sem-current" className="text-sm text-slate-700 dark:text-slate-300">
                Make this my current semester
              </label>
            </div>
          </div>
          <div className="mt-4">
            <Button type="submit" disabled={semesterSaving}>
              Add semester
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card padding="p-4 sm:p-5" className="border border-indigo-200/60 ring-1 ring-indigo-500/10 dark:border-indigo-500/25">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Timeline</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">
                {semesterPct != null ? `${Math.round(semesterPct)}%` : '—'}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {stats?.currentSemester?.name ||
                  'Add a semester above and mark it current, or choose “Set as current” on an existing term.'}
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25">
              <FiTrendingUp className="h-5 w-5" aria-hidden />
            </span>
          </div>
          {semesterPct != null && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200/90 dark:bg-slate-700/80">
              <div
                className="h-full rounded-full bg-linear-to-r from-indigo-500 to-violet-500 transition-[width] duration-500 ease-out"
                style={{ width: `${semesterPct}%` }}
              />
            </div>
          )}
        </Card>

        <Card padding="p-4 sm:p-5" className="border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Assignments</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">{assignmentDone}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Completed of {assignmentTotal}
                {assignmentTotal > 0 ? ` (${assignmentBarPct}%)` : ''}
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <FiClipboard className="h-5 w-5" aria-hidden />
            </span>
          </div>
          {assignmentTotal > 0 && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200/90 dark:bg-slate-700/80">
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width] duration-500 ease-out dark:bg-emerald-400"
                style={{ width: `${assignmentBarPct}%` }}
              />
            </div>
          )}
        </Card>

        <Card padding="p-4 sm:p-5" className="border border-slate-200/80 sm:col-span-2 lg:col-span-1 dark:border-slate-700/80">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Attendance</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">
                {att?.attendancePercentage != null ? `${att.attendancePercentage}%` : '—'}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {att?.totalSessions ?? 0} session{att?.totalSessions === 1 ? '' : 's'} logged
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <FiCalendar className="h-5 w-5" aria-hidden />
            </span>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
            <FiBarChart2 className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Credit planning</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              You have <span className="font-semibold text-slate-800 dark:text-slate-200">{registeredCredits}</span>{' '}
              credits from enrolled courses. Enter a target load below to see the gap—for planning only; it is not
              saved to your account.
            </p>
          </div>
        </div>
        <div className="mt-5 max-w-md space-y-3">
          <div>
            <label htmlFor="planned-credits" className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Target credits (optional)
            </label>
            <input
              id="planned-credits"
              type="number"
              min={0}
              inputMode="decimal"
              placeholder="e.g. 18"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={plannedCredits}
              onChange={(e) => setPlannedCredits(e.target.value)}
            />
          </div>
          {plannedValid && (
            <p className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200">
              {creditDelta === 0 && 'That matches your registered credits.'}
              {creditDelta != null && creditDelta > 0 && (
                <>
                  <span className="font-medium text-amber-800 dark:text-amber-200">+{creditDelta}</span> over your
                  registered load—double-check deadlines and workload.
                </>
              )}
              {creditDelta != null && creditDelta < 0 && (
                <>
                  <span className="font-medium text-slate-900 dark:text-white">{Math.abs(creditDelta)}</span> fewer
                  than registered—lighter term or you are still adding courses.
                </>
              )}
            </p>
          )}
          {plannedCredits !== '' && !plannedValid && (
            <p className="text-sm text-rose-600 dark:text-rose-400">Enter a valid non-negative number.</p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Log a session</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          One row per class meeting. Pick the course, date, and outcome—then save.
        </p>
        {!hasCourses && (
          <p className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            Add at least one course before you can log attendance.
          </p>
        )}
        <form
          className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          onSubmit={logAttendance}
        >
          <div className="min-w-0 sm:col-span-2 xl:col-span-1">
            <label htmlFor="att-course" className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Course
            </label>
            <select
              id="att-course"
              required
              disabled={!hasCourses}
              className="mt-1 w-full max-w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/80"
              value={attForm.courseId}
              onChange={(e) => setAttForm({ ...attForm, courseId: e.target.value })}
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label htmlFor="att-date" className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Session date
            </label>
            <input
              id="att-date"
              type="date"
              required
              disabled={!hasCourses}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/80"
              value={attForm.sessionDate}
              onChange={(e) => setAttForm({ ...attForm, sessionDate: e.target.value })}
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="att-status" className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Status
            </label>
            <select
              id="att-status"
              disabled={!hasCourses}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/80"
              value={attForm.status}
              onChange={(e) => setAttForm({ ...attForm, status: e.target.value })}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end sm:col-span-2 xl:col-span-1">
            <Button type="submit" className="w-full" disabled={!hasCourses}>
              Save session
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
