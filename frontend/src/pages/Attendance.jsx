import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

const STATUS_COLORS = {
  present: '#22c55e',
  late: '#f59e0b',
  absent: '#ef4444',
  excused: '#6366f1',
};

function pct(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 1000) / 10;
}

export default function Attendance() {
  const [loading, setLoading] = useState(true);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [examRows, setExamRows] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [summaryRes, attendanceRes, examsRes, coursesRes] = await Promise.allSettled([
          api.get('/attendance/summary'),
          api.get('/attendance'),
          api.get('/exams', { params: { page: 1, limit: 100, sort: 'exam_date', order: 'desc' } }),
          api.get('/courses', { params: { page: 1, limit: 200 } }),
        ]);
        if (cancelled) return;
        if (summaryRes.status === 'fulfilled' && summaryRes.value.data.success) {
          setAttendanceSummary(summaryRes.value.data.data);
        }
        if (attendanceRes.status === 'fulfilled' && attendanceRes.value.data.success) {
          setAttendanceRows(attendanceRes.value.data.data);
        }
        if (examsRes.status === 'fulfilled' && examsRes.value.data.success) {
          setExamRows(examsRes.value.data.data);
        }
        if (coursesRes.status === 'fulfilled' && coursesRes.value.data.success) {
          setCourses(coursesRes.value.data.data);
        }

        if (
          summaryRes.status === 'rejected' &&
          attendanceRes.status === 'rejected' &&
          examsRes.status === 'rejected' &&
          coursesRes.status === 'rejected'
        ) {
          throw summaryRes.reason || attendanceRes.reason || examsRes.reason || coursesRes.reason;
        }
      } catch (err) {
        if (!cancelled) toast.error(err.friendlyMessage || 'Failed to load attendance analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const {
    perCourse,
    attendanceStatusData,
    courseComparisonData,
    examTypeData,
    overallExamCount,
    gradedExamCount,
    attendanceAxisMax,
    examsAxisMax,
  } = useMemo(() => {
    const courseBase = new Map();
    for (const c of courses) {
      courseBase.set(c.id, {
        courseId: c.id,
        courseCode: c.code,
        courseTitle: c.title,
        courseColor: c.color || '#6366f1',
        totalSessions: 0,
        present: 0,
        late: 0,
        absent: 0,
        excused: 0,
        attendancePct: 0,
        examCount: 0,
        gradedExamCount: 0,
      });
    }

    for (const r of attendanceRows) {
      const entry =
        courseBase.get(r.courseId) ||
        {
          courseId: r.courseId,
          courseCode: r.courseCode || 'N/A',
          courseTitle: r.courseTitle || 'Untitled course',
          courseColor: '#6366f1',
          totalSessions: 0,
          present: 0,
          late: 0,
          absent: 0,
          excused: 0,
          attendancePct: 0,
          examCount: 0,
          gradedExamCount: 0,
        };
      entry.totalSessions += 1;
      if (r.status === 'present') entry.present += 1;
      else if (r.status === 'late') entry.late += 1;
      else if (r.status === 'absent') entry.absent += 1;
      else entry.excused += 1;
      courseBase.set(r.courseId, entry);
    }

    const examTypeMap = new Map();
    for (const ex of examRows) {
      const entry = courseBase.get(ex.courseId);
      if (!entry) continue;
      entry.examCount += 1;
      if (ex.marks != null) {
        entry.gradedExamCount += 1;
      }
      const tKey = ex.examType || 'other';
      const typeEntry = examTypeMap.get(tKey) || { examType: tKey, count: 0, graded: 0 };
      typeEntry.count += 1;
      if (ex.marks != null) {
        typeEntry.graded += 1;
      }
      examTypeMap.set(tKey, typeEntry);
    }

    const perCourseData = [...courseBase.values()]
      .map((c) => {
        const presentLike = c.present + c.late;
        const attendancePctValue = pct(presentLike, c.totalSessions);
        return {
          ...c,
          attendancePct: attendancePctValue,
        };
      })
      .sort((a, b) => {
        if (b.totalSessions !== a.totalSessions) return b.totalSessions - a.totalSessions;
        return a.courseCode.localeCompare(b.courseCode);
      });

    const statusData = [
      { name: 'Present', value: attendanceSummary?.presentCount || 0, color: STATUS_COLORS.present },
      { name: 'Late', value: attendanceSummary?.lateCount || 0, color: STATUS_COLORS.late },
      { name: 'Absent', value: attendanceSummary?.absentCount || 0, color: STATUS_COLORS.absent },
      {
        name: 'Excused',
        value:
          Math.max(
            0,
            Number(attendanceSummary?.totalSessions || 0) -
              Number(attendanceSummary?.presentCount || 0) -
              Number(attendanceSummary?.lateCount || 0) -
              Number(attendanceSummary?.absentCount || 0)
          ) || 0,
        color: STATUS_COLORS.excused,
      },
    ].filter((d) => d.value > 0);

    const compareData = perCourseData
      .filter((c) => c.totalSessions > 0 || c.examCount > 0)
      .map((c) => ({
        name: c.courseCode,
        attendance: c.attendancePct,
        exams: c.examCount,
      }));

    const typeData = [...examTypeMap.values()]
      .map((t) => ({
        examType: t.examType,
        count: t.count,
        graded: t.graded,
      }))
      .sort((a, b) => b.count - a.count);

    const overallExams = examRows.length;
    const gradedExams = examRows.filter((e) => e.marks != null);
    const attendanceMax = Math.max(100, ...compareData.map((c) => c.attendance || 0));
    const examsMax = Math.max(1, ...compareData.map((c) => c.exams || 0));

    return {
      perCourse: perCourseData,
      attendanceStatusData: statusData,
      courseComparisonData: compareData,
      examTypeData: typeData,
      overallExamCount: overallExams,
      gradedExamCount: gradedExams.length,
      attendanceAxisMax: Math.ceil(attendanceMax / 10) * 10,
      examsAxisMax: examsMax,
    };
  }, [attendanceRows, attendanceSummary, examRows, courses]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const noData = (attendanceSummary?.totalSessions || 0) === 0 && examRows.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Attendance analytics</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Track class attendance and exam performance together, overall and for each course.
        </p>
      </div>

      {noData ? (
        <EmptyState
          title="No attendance or exam data yet"
          description="Log class sessions from Semester and add exams to unlock detailed analytics here."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card padding="p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Class attendance rate</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">
                {attendanceSummary ? `${attendanceSummary.attendancePercentage}%` : '—'}
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {attendanceSummary?.presentCount || 0} present/late out of {attendanceSummary?.totalSessions || 0} sessions
              </p>
            </Card>
            <Card padding="p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Sessions logged</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">
                {attendanceSummary?.totalSessions || 0}
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Absent: {attendanceSummary?.absentCount || 0} • Late: {attendanceSummary?.lateCount || 0}
              </p>
            </Card>
            <Card padding="p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Exams recorded</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">{overallExamCount}</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{gradedExamCount} with marks</p>
            </Card>
            <Card padding="p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Courses with graded exams</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">
                {perCourse.filter((c) => c.gradedExamCount > 0).length}
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">At least one exam mark recorded</p>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-1" padding="p-5">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Class attendance status</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Present, late, absent, and excused sessions</p>
              <div className="mt-4 h-64">
                {attendanceStatusData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    No class sessions logged yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="52%"
                        outerRadius="80%"
                        paddingAngle={2}
                      >
                        {attendanceStatusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v} sessions`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card className="xl:col-span-2" padding="p-5">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Per-course performance</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Compare class attendance percentage against total exams recorded
              </p>
              <div className="mt-4 h-72">
                {courseComparisonData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    No course-level metrics yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={courseComparisonData} margin={{ top: 4, right: 8, left: 0, bottom: 6 }}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" domain={[0, attendanceAxisMax]} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, examsAxisMax]} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(v, n) => [`${v}${n === 'Attendance %' ? '%' : ''}`, n]} />
                      <Bar dataKey="attendance" name="Attendance %" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      <Bar yAxisId="right" dataKey="exams" name="Exams recorded" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-1" padding="p-5">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Exam type snapshot</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Volume and graded count by exam type</p>
              <ul className="mt-4 space-y-2.5">
                {examTypeData.length === 0 ? (
                  <li className="text-sm text-slate-500 dark:text-slate-400">No exams available yet.</li>
                ) : (
                  examTypeData.map((item) => (
                    <li
                      key={item.examType}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800/50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="capitalize text-slate-800 dark:text-slate-100">{item.examType}</span>
                        <span className="tabular-nums text-slate-600 dark:text-slate-300">{item.count}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Graded entries: {item.graded}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </Card>

            <Card className="xl:col-span-2" padding="p-0 overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Detailed course breakdown</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Whole-term class attendance and exam outcomes for each course
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50/80 text-left text-xs text-slate-500 dark:bg-slate-900/60">
                    <tr>
                      <th className="px-4 py-3 font-medium">Course</th>
                      <th className="px-4 py-3 font-medium">Class sessions</th>
                      <th className="px-4 py-3 font-medium">Present / late</th>
                      <th className="px-4 py-3 font-medium">Absent</th>
                      <th className="px-4 py-3 font-medium">Attendance %</th>
                      <th className="px-4 py-3 font-medium">Exams</th>
                      <th className="px-4 py-3 font-medium">Graded exams</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {perCourse.map((c) => (
                      <tr key={c.courseId} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: c.courseColor || '#6366f1' }}
                              aria-hidden
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 dark:text-white">{c.courseCode}</p>
                              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{c.courseTitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 tabular-nums">{c.totalSessions}</td>
                        <td className="px-4 py-3 tabular-nums">{c.present + c.late}</td>
                        <td className="px-4 py-3 tabular-nums">{c.absent}</td>
                        <td className="px-4 py-3 tabular-nums">{c.totalSessions ? `${c.attendancePct}%` : '—'}</td>
                        <td className="px-4 py-3 tabular-nums">{c.examCount}</td>
                        <td className="px-4 py-3 tabular-nums">{c.gradedExamCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
