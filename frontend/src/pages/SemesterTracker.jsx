import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

export default function SemesterTracker() {
  const [stats, setStats] = useState(null);
  const [att, setAtt] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gpaIn, setGpaIn] = useState({ points: '', credits: '' });
  const [attForm, setAttForm] = useState({ courseId: '', sessionDate: new Date().toISOString().slice(0, 10), status: 'present' });

  const load = async () => {
    setLoading(true);
    try {
      const [d, a, c] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/attendance/summary'),
        api.get('/courses', { params: { limit: 100 } }),
      ]);
      if (d.data.success) setStats(d.data.data);
      if (a.data.success) setAtt(a.data.data);
      if (c.data.success) setCourses(c.data.data);
    } catch {
      toast.error('Failed to load tracker data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const logAttendance = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance', {
        courseId: Number(attForm.courseId),
        sessionDate: attForm.sessionDate,
        status: attForm.status,
      });
      toast.success('Attendance saved');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save');
    }
  };

  const creditsNum = Number(gpaIn.credits);
  const pointsNum = Number(gpaIn.points);
  const manualGpa =
    gpaIn.credits && gpaIn.points && creditsNum !== 0
      ? (pointsNum / creditsNum).toFixed(2)
      : null;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Semester tracker</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Progress, workload, attendance, and quick calculators.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Semester progress</p>
          <p className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white">
            {stats?.semesterProgressPercent != null ? `${stats.semesterProgressPercent}%` : '—'}
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{stats?.currentSemester?.name || 'Mark a semester as current'}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Assignments</p>
          <p className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white">{stats?.assignments?.completed ?? 0}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Completed of {stats?.assignments?.total ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Attendance</p>
          <p className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white">
            {att?.attendancePercentage != null ? `${att.attendancePercentage}%` : '—'}
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{att?.totalSessions ?? 0} sessions logged</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Credit calculator</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Total credits registered in courses: {stats?.credits?.total ?? 0}</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(`Planned load: ${Number(gpaIn.credits || 0)} credits`);
            }}
          >
            <div>
              <label className="text-xs font-semibold text-slate-500">Hypothetical credits</label>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
                value={gpaIn.credits}
                onChange={(e) => setGpaIn({ ...gpaIn, credits: e.target.value })}
              />
            </div>
            <Button type="submit" variant="outline">
              Store planning value
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">GPA calculator</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Divide total grade points by credits to estimate term GPA.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500">Grade points</label>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
                value={gpaIn.points}
                onChange={(e) => setGpaIn({ ...gpaIn, points: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Credits</label>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
                value={gpaIn.credits}
                onChange={(e) => setGpaIn({ ...gpaIn, credits: e.target.value })}
              />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-700 dark:text-slate-200">
            Estimated GPA: <span className="font-semibold">{manualGpa ?? '—'}</span>
          </p>
          <p className="mt-2 text-xs text-slate-500">API estimate: {stats?.gradeOverview?.estimatedGpa?.toFixed(2) ?? '—'}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Log attendance</h2>
        <form className="mt-4 grid gap-3 sm:grid-cols-4" onSubmit={logAttendance}>
          <select
            required
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
            value={attForm.courseId}
            onChange={(e) => setAttForm({ ...attForm, courseId: e.target.value })}
          >
            <option value="">Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
            value={attForm.sessionDate}
            onChange={(e) => setAttForm({ ...attForm, sessionDate: e.target.value })}
          />
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
            value={attForm.status}
            onChange={(e) => setAttForm({ ...attForm, status: e.target.value })}
          >
            {['present', 'late', 'absent', 'excused'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button type="submit">Save session</Button>
        </form>
      </Card>
    </div>
  );
}
