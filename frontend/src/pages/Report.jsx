import { useEffect, useMemo, useState } from 'react';
import { compareAsc, format, parseISO, startOfDay } from 'date-fns';
import { FiCalendar, FiClock, FiDownload } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { STUDENT_BASE } from '../layouts/StudentLayout';

const ASSIGNMENT_STATUS_COLORS = {
  pending: '#f59e0b',
  submitted: '#6366f1',
  graded: '#10b981',
  late: '#ef4444',
};

const ATTENDANCE_STATUS_COLORS = {
  present: '#22c55e',
  late: '#f59e0b',
  absent: '#ef4444',
  excused: '#6366f1',
};

const EXAM_STATUS_COLORS = {
  Attended: '#10b981',
  Missed: '#ef4444',
  Upcoming: '#6366f1',
};

function pct(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 1000) / 10;
}

function CompactCourseTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  const classesTotal = (row.classesAttended || 0) + (row.classesGap || 0);
  const assignmentsTotal = (row.assignmentsDone || 0) + (row.assignmentsGap || 0);
  const examsTotal = (row.examsGraded || 0) + (row.examsGap || 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2.5 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900/95">
      <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
      <p className="mt-1 text-[#6366f1] dark:text-indigo-300">
        Class done: <span className="font-semibold tabular-nums">{row.classesAttended || 0}</span> out of{' '}
        <span className="font-semibold tabular-nums">{classesTotal}</span>
      </p>
      <p className="text-[#f59e0b] dark:text-amber-300">
        Assignment done: <span className="font-semibold tabular-nums">{row.assignmentsDone || 0}</span> out of{' '}
        <span className="font-semibold tabular-nums">{assignmentsTotal}</span>
      </p>
      <p className="text-[#10b981] dark:text-emerald-300">
        Exam done: <span className="font-semibold tabular-nums">{row.examsGraded || 0}</span> out of{' '}
        <span className="font-semibold tabular-nums">{examsTotal}</span>
      </p>
    </div>
  );
}

export default function Report() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  /** Pending-only list (deadline asc) so the upcoming widget is not capped by old graded rows. */
  const [assignmentsPending, setAssignmentsPending] = useState([]);
  const [exams, setExams] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [statsRes, coursesRes, assignmentsRes, assignmentsPendingRes, examsRes, attendanceRes, attendanceSummaryRes] =
          await Promise.allSettled([
            api.get('/dashboard/stats'),
            api.get('/courses', { params: { page: 1, limit: 200 } }),
            api.get('/assignments', { params: { page: 1, limit: 100, sort: 'deadline', order: 'asc' } }),
            api.get('/assignments', {
              params: { page: 1, limit: 100, status: 'pending', sort: 'deadline', order: 'asc' },
            }),
            api.get('/exams', { params: { page: 1, limit: 100, sort: 'exam_date', order: 'desc' } }),
            api.get('/attendance'),
            api.get('/attendance/summary'),
          ]);
        if (cancelled) return;

        if (statsRes.status === 'fulfilled' && statsRes.value.data.success) setStats(statsRes.value.data.data);
        if (coursesRes.status === 'fulfilled' && coursesRes.value.data.success) setCourses(coursesRes.value.data.data);
        if (assignmentsRes.status === 'fulfilled' && assignmentsRes.value.data.success)
          setAssignments(assignmentsRes.value.data.data);
        if (assignmentsPendingRes.status === 'fulfilled' && assignmentsPendingRes.value.data.success)
          setAssignmentsPending(assignmentsPendingRes.value.data.data);
        if (examsRes.status === 'fulfilled' && examsRes.value.data.success) setExams(examsRes.value.data.data);
        if (attendanceRes.status === 'fulfilled' && attendanceRes.value.data.success)
          setAttendance(attendanceRes.value.data.data);
        if (attendanceSummaryRes.status === 'fulfilled' && attendanceSummaryRes.value.data.success)
          setAttendanceSummary(attendanceSummaryRes.value.data.data);

        if (
          statsRes.status === 'rejected' &&
          coursesRes.status === 'rejected' &&
          assignmentsRes.status === 'rejected' &&
          assignmentsPendingRes.status === 'rejected' &&
          examsRes.status === 'rejected' &&
          attendanceRes.status === 'rejected' &&
          attendanceSummaryRes.status === 'rejected'
        ) {
          throw statsRes.reason;
        }
      } catch (err) {
        if (!cancelled) toast.error(err.friendlyMessage || 'Failed to load report data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const derived = useMemo(() => {
    const assignmentStatusCounts = { pending: 0, submitted: 0, graded: 0, late: 0 };
    for (const a of assignments) {
      if (assignmentStatusCounts[a.submissionStatus] == null) assignmentStatusCounts[a.submissionStatus] = 0;
      assignmentStatusCounts[a.submissionStatus] += 1;
    }

    const assignmentStatusData = Object.entries(assignmentStatusCounts)
      .map(([name, value]) => ({
        name,
        value,
        color: ASSIGNMENT_STATUS_COLORS[name] || '#94a3b8',
      }))
      .filter((x) => x.value > 0);

    const courseMap = new Map();
    for (const c of courses) {
      courseMap.set(c.id, {
        courseId: c.id,
        courseCode: c.code,
        courseTitle: c.title,
        courseColor: c.color || '#6366f1',
        attendanceTotal: 0,
        attendancePresentLike: 0,
        assignmentsTotal: 0,
        assignmentsDone: 0,
        examsTotal: 0,
        gradedExams: 0,
      });
    }

    for (const at of attendance) {
      const entry = courseMap.get(at.courseId);
      if (!entry) continue;
      entry.attendanceTotal += 1;
      if (at.status === 'present' || at.status === 'late') entry.attendancePresentLike += 1;
    }
    for (const a of assignments) {
      const entry = courseMap.get(a.courseId);
      if (!entry) continue;
      entry.assignmentsTotal += 1;
      if (a.submissionStatus === 'submitted' || a.submissionStatus === 'graded') entry.assignmentsDone += 1;
    }
    for (const e of exams) {
      const entry = courseMap.get(e.courseId);
      if (!entry) continue;
      entry.examsTotal += 1;
      if (e.marks != null) entry.gradedExams += 1;
    }

    const perCourse = [...courseMap.values()]
      .map((c) => ({
        ...c,
        attendancePct: pct(c.attendancePresentLike, c.attendanceTotal),
        assignmentDonePct: pct(c.assignmentsDone, c.assignmentsTotal),
      }))
      .sort((a, b) => {
        const totalA = a.attendanceTotal + a.assignmentsTotal + a.examsTotal;
        const totalB = b.attendanceTotal + b.assignmentsTotal + b.examsTotal;
        if (totalB !== totalA) return totalB - totalA;
        return a.courseCode.localeCompare(b.courseCode);
      });

    const comparisonChartData = perCourse
      .filter((c) => c.attendanceTotal > 0 || c.assignmentsTotal > 0 || c.examsTotal > 0)
      .map((c) => ({
        code: c.courseCode,
        classesAttended: c.attendancePresentLike,
        classesGap: Math.max(0, c.attendanceTotal - c.attendancePresentLike),
        assignmentsDone: c.assignmentsDone,
        assignmentsGap: Math.max(0, c.assignmentsTotal - c.assignmentsDone),
        examsGraded: c.gradedExams,
        examsGap: Math.max(0, c.examsTotal - c.gradedExams),
      }));

    const attendanceStatusData = [
      { name: 'present', value: attendanceSummary?.presentCount || 0, color: ATTENDANCE_STATUS_COLORS.present },
      { name: 'late', value: attendanceSummary?.lateCount || 0, color: ATTENDANCE_STATUS_COLORS.late },
      { name: 'absent', value: attendanceSummary?.absentCount || 0, color: ATTENDANCE_STATUS_COLORS.absent },
      {
        name: 'excused',
        value: Math.max(
          0,
          Number(attendanceSummary?.totalSessions || 0) -
            Number(attendanceSummary?.presentCount || 0) -
            Number(attendanceSummary?.lateCount || 0) -
            Number(attendanceSummary?.absentCount || 0)
        ),
        color: ATTENDANCE_STATUS_COLORS.excused,
      },
    ].filter((x) => x.value > 0);

    const startToday = startOfDay(new Date());

    let examsAttendedCount = 0;
    let examsMissedCount = 0;
    let examsUpcomingCount = 0;
    for (const e of exams) {
      if (!e.examDate) continue;
      try {
        const d = startOfDay(parseISO(String(e.examDate).slice(0, 10)));
        if (d >= startToday) {
          examsUpcomingCount += 1;
        } else if (e.marks != null) {
          examsAttendedCount += 1;
        } else {
          examsMissedCount += 1;
        }
      } catch {
        /* skip malformed dates */
      }
    }

    const examStatusData = [
      { name: 'Attended', value: examsAttendedCount, color: EXAM_STATUS_COLORS.Attended },
      { name: 'Missed', value: examsMissedCount, color: EXAM_STATUS_COLORS.Missed },
      { name: 'Upcoming', value: examsUpcomingCount, color: EXAM_STATUS_COLORS.Upcoming },
    ].filter((x) => x.value > 0);

    const examsUpcoming = exams.filter((e) => {
      if (!e.examDate) return false;
      try {
        const d = startOfDay(parseISO(String(e.examDate).slice(0, 10)));
        return d >= startToday;
      } catch {
        return false;
      }
    }).length;
    const examsCompleted = Math.max(0, exams.length - examsUpcoming);

    const upcomingExamsPreview = [...exams]
      .filter((e) => {
        if (!e.examDate) return false;
        try {
          const d = startOfDay(parseISO(String(e.examDate).slice(0, 10)));
          return d >= startToday;
        } catch {
          return false;
        }
      })
      .sort((a, b) =>
        compareAsc(parseISO(String(a.examDate).slice(0, 10)), parseISO(String(b.examDate).slice(0, 10)))
      )
      .slice(0, 2);

    const deadlineStillAhead = (a) => {
      if (!a.deadline) return false;
      try {
        return new Date(a.deadline) >= new Date();
      } catch {
        return false;
      }
    };
    const upcomingByDeadline = [...assignmentsPending.filter(deadlineStillAhead)];
    for (const a of assignments) {
      if (a.submissionStatus !== 'late' || !deadlineStillAhead(a)) continue;
      if (!upcomingByDeadline.some((x) => x.id === a.id)) upcomingByDeadline.push(a);
    }
    const upcomingAssignmentsPreview = upcomingByDeadline
      .sort((a, b) => compareAsc(new Date(a.deadline), new Date(b.deadline)))
      .slice(0, 1);

    return {
      assignmentStatusData,
      examStatusData,
      perCourse,
      comparisonChartData,
      attendanceStatusData,
      examsUpcoming,
      examsCompleted,
      upcomingExamsPreview,
      upcomingAssignmentsPreview,
      frequencyAxisMax: Math.max(
        1,
        ...comparisonChartData.map((x) =>
          Math.max(
            (x.classesAttended || 0) + (x.classesGap || 0),
            (x.assignmentsDone || 0) + (x.assignmentsGap || 0),
            (x.examsGraded || 0) + (x.examsGap || 0)
          )
        )
      ),
    };
  }, [assignments, assignmentsPending, attendance, attendanceSummary, courses, exams]);

  const exportPdf = () => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const generatedAt = new Date();

      doc.setFontSize(18);
      doc.text('Student Academic Report', 40, 44);
      doc.setFontSize(10);
      doc.setTextColor(90);
      doc.text(`Generated: ${format(generatedAt, 'PPpp')}`, 40, 62);

      autoTable(doc, {
        startY: 78,
        head: [['Metric', 'Value']],
        body: [
          ['Courses tracked', String(courses.length)],
          ['Assignments total', String(assignments.length)],
          ['Assignments completed/submitted', String(assignments.filter((a) => a.submissionStatus === 'submitted' || a.submissionStatus === 'graded').length)],
          ['Exams recorded', String(exams.length)],
          ['Class sessions logged', String(attendanceSummary?.totalSessions || 0)],
          ['Attendance rate', `${attendanceSummary?.attendancePercentage ?? 0}%`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [['Course', 'Attendance %', 'Classes (attended/total)', 'Assignments (done/total)', 'Exams']],
        body: derived.perCourse.map((c) => [
          `${c.courseCode} - ${c.courseTitle}`,
          c.attendanceTotal > 0 ? `${c.attendancePct}%` : '—',
          c.attendanceTotal > 0 ? `${c.attendancePresentLike}/${c.attendanceTotal}` : '—',
          `${c.assignmentsDone}/${c.assignmentsTotal}`,
          String(c.examsTotal),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 9, cellPadding: 5 },
        margin: { left: 28, right: 28 },
      });

      if (assignments.length > 0) {
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 18,
          head: [['Assignment', 'Course', 'Status', 'Deadline']],
          body: assignments.slice(0, 25).map((a) => [
            a.title,
            a.courseCode || '—',
            a.submissionStatus,
            a.deadline ? format(new Date(a.deadline), 'PP p') : '—',
          ]),
          theme: 'plain',
          headStyles: { textColor: [15, 23, 42], fillColor: [226, 232, 240] },
          styles: { fontSize: 8.5, cellPadding: 4 },
          margin: { left: 28, right: 28 },
        });
      }

      doc.save(`semester-report-${format(generatedAt, 'yyyy-MM-dd')}.pdf`);
      toast.success('Report downloaded');
    } catch {
      toast.error('Could not generate PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const noData =
    courses.length === 0 &&
    assignments.length === 0 &&
    exams.length === 0 &&
    (attendanceSummary?.totalSessions || 0) === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Report</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Detailed analytics up to {format(new Date(), 'PP')} across courses, attendance, exams, and assignments.
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={exportPdf}>
          <FiDownload /> Download PDF
        </Button>
      </div>

      {noData ? (
        <EmptyState
          title="No reportable data yet"
          description="Add courses, assignments, exams, and attendance logs to generate a complete report."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
            <Link to={`${STUDENT_BASE}/courses`} className="block min-w-0">
              <Card
                padding="p-4"
                className="h-full border border-indigo-200/70 transition hover:-translate-y-0.5 hover:border-indigo-400/80 hover:shadow-lg hover:shadow-indigo-500/15 dark:border-indigo-500/20"
              >
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Courses</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">{courses.length}</p>
              </Card>
            </Link>
            <Link to={`${STUDENT_BASE}/assignments`} className="block min-w-0">
              <Card
                padding="p-4"
                className="h-full border border-indigo-200/70 transition hover:-translate-y-0.5 hover:border-indigo-400/80 hover:shadow-lg hover:shadow-indigo-500/15 dark:border-indigo-500/20"
              >
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Assignments</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">{assignments.length}</p>
              </Card>
            </Link>
            <Link to={`${STUDENT_BASE}/exams`} className="block min-w-0">
              <Card
                padding="p-4"
                className="h-full border border-indigo-200/70 transition hover:-translate-y-0.5 hover:border-indigo-400/80 hover:shadow-lg hover:shadow-indigo-500/15 dark:border-indigo-500/20"
              >
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Exams</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">{exams.length}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {derived.examsCompleted} completed • {derived.examsUpcoming} upcoming
                </p>
              </Card>
            </Link>
            <Link to={`${STUDENT_BASE}/attendance`} className="block min-w-0">
              <Card
                padding="p-4"
                className="h-full border border-indigo-200/70 transition hover:-translate-y-0.5 hover:border-indigo-400/80 hover:shadow-lg hover:shadow-indigo-500/15 dark:border-indigo-500/20"
              >
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Attendance sessions</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">
                  {attendanceSummary?.totalSessions || 0}
                </p>
              </Card>
            </Link>
            <Link
              to={`${STUDENT_BASE}/attendance`}
              className="col-span-2 block min-w-0 xl:col-span-1"
            >
              <Card
                padding="p-4"
                className="h-full border border-indigo-200/70 transition hover:-translate-y-0.5 hover:border-indigo-400/80 hover:shadow-lg hover:shadow-indigo-500/15 dark:border-indigo-500/20"
              >
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Attendance rate</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">
                  {attendanceSummary?.attendancePercentage ?? 0}%
                </p>
              </Card>
            </Link>
          </div>

          <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="xl:col-span-1" padding="p-5">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Assignment status</h2>
              <p className="mt-1 min-h-10 text-xs leading-snug text-slate-500 dark:text-slate-400">
                By submission status
              </p>
              <div className="mt-4 h-64">
                {derived.assignmentStatusData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    No assignments yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={derived.assignmentStatusData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80}>
                        {derived.assignmentStatusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v}`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card className="xl:col-span-1" padding="p-5">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Exam status</h2>
              <p className="mt-1 min-h-10 text-xs leading-snug text-slate-500 dark:text-slate-400">
                Total {exams.length} · attended, missed, upcoming
              </p>
              <div className="mt-4 h-64">
                {exams.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    No exams recorded yet.
                  </div>
                ) : derived.examStatusData.length === 0 ? (
                  <div className="flex h-full items-center justify-center px-2 text-center text-sm text-slate-500 dark:text-slate-400">
                    Invalid exam dates.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={derived.examStatusData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80}>
                        {derived.examStatusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v} exam${Number(v) === 1 ? '' : 's'}`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card className="xl:col-span-1" padding="p-5">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Attendance status</h2>
              <p className="mt-1 min-h-10 text-xs leading-snug text-slate-500 dark:text-slate-400">
                Present, late, absent, excused
              </p>
              <div className="mt-4 h-64">
                {derived.attendanceStatusData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    No attendance sessions yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={derived.attendanceStatusData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80}>
                        {derived.attendanceStatusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v} sessions`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card className="xl:col-span-1" padding="p-5">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Summary snapshot</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Latest high-level indicators</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                  Assignments done: {stats?.assignments?.completed ?? 0}/{stats?.assignments?.total ?? assignments.length}
                </li>
                <li className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                  Semester progress: {stats?.semesterProgressPercent != null ? `${stats.semesterProgressPercent}%` : '—'}
                </li>
                <li className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                  Current semester: {stats?.currentSemester?.name || 'Not set'}
                </li>
                <li className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                  Credits tracked: {stats?.credits?.total ?? 0}
                </li>
                <li className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                  Upcoming exams: {derived.examsUpcoming}
                </li>
              </ul>
            </Card>
          </div>

          <Card padding="p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Per-course comparison</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Double-layer view: held vs your participation/completion in each course
            </p>
            <div className="mt-4 h-80">
              {derived.comparisonChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                  Add records to see course analytics.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={derived.comparisonChartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                    <XAxis dataKey="code" tickLine={false} axisLine={false} />
                    <YAxis domain={[0, derived.frequencyAxisMax]} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<CompactCourseTooltip />} />
                    <Bar stackId="classes" dataKey="classesAttended" name="Classes attended" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar stackId="classes" dataKey="classesGap" name="Classes not attended" fill="#c7d2fe" radius={[6, 6, 0, 0]} />

                    <Bar stackId="assignments" dataKey="assignmentsDone" name="Assignments completed" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    <Bar stackId="assignments" dataKey="assignmentsGap" name="Assignments pending" fill="#fde68a" radius={[6, 6, 0, 0]} />

                    <Bar stackId="exams" dataKey="examsGraded" name="Exams graded" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar stackId="exams" dataKey="examsGap" name="Exams without result" fill="#a7f3d0" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card padding="p-0 overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Detailed course report</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Full breakdown by course as of {format(new Date(), 'PP')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50/80 text-left text-xs text-slate-500 dark:bg-slate-900/60">
                  <tr>
                    <th className="px-4 py-3 font-medium">Course</th>
                    <th className="px-4 py-3 font-medium">Attendance %</th>
                    <th
                      className="px-4 py-3 font-medium"
                      title="Present or late sessions you logged, out of all class sessions recorded for this course."
                    >
                      Classes (attended / total)
                    </th>
                    <th className="px-4 py-3 font-medium">Assignments (done/total)</th>
                    <th className="px-4 py-3 font-medium">Exams</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {derived.perCourse.map((c) => {
                    const attendanceStrong =
                      c.attendanceTotal > 0 && c.attendancePct > 94;
                    const attendanceWeak =
                      c.attendanceTotal > 0 && c.attendancePct < 85;
                    const assignmentsAllDone =
                      c.assignmentsTotal > 0 && c.assignmentsDone === c.assignmentsTotal;
                    const examsAllParticipated =
                      c.examsTotal > 0 && c.gradedExams === c.examsTotal;
                    const cellBase = 'px-4 py-3 tabular-nums text-slate-700 dark:text-slate-300';
                    const cellGreen =
                      'px-4 py-3 tabular-nums font-semibold text-emerald-600 dark:text-emerald-400';
                    const cellRed =
                      'px-4 py-3 tabular-nums font-semibold text-red-600 dark:text-red-400';
                    const attendanceCellClass =
                      c.attendanceTotal > 0
                        ? attendanceStrong
                          ? cellGreen
                          : attendanceWeak
                            ? cellRed
                            : cellBase
                        : cellBase;
                    return (
                    <tr key={c.courseId} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.courseColor }} />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white">{c.courseCode}</p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{c.courseTitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className={attendanceCellClass}>
                        {c.attendanceTotal > 0 ? `${c.attendancePct}%` : '—'}
                      </td>
                      <td className={attendanceCellClass}>
                        {c.attendanceTotal > 0 ? `${c.attendancePresentLike}/${c.attendanceTotal}` : '—'}
                      </td>
                      <td className={assignmentsAllDone ? cellGreen : cellBase}>
                        {c.assignmentsDone}/{c.assignmentsTotal}
                      </td>
                      <td className={examsAllParticipated ? cellGreen : cellBase}>{c.examsTotal}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card
              padding="p-5"
              className="relative overflow-hidden !bg-gradient-to-br from-emerald-50/95 via-white/90 to-teal-50/60 border-2 border-emerald-400/70 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-300/40 dark:from-emerald-950/50 dark:via-slate-900/90 dark:to-emerald-950/30 dark:border-emerald-500/45 dark:shadow-emerald-950/30 dark:ring-emerald-500/25"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 dark:from-emerald-500 dark:via-teal-500 dark:to-emerald-400"
                aria-hidden
              />
              <header className="relative z-10 flex min-h-13 items-center justify-between gap-3 border-b border-emerald-200/55 pb-3.5 dark:border-emerald-800/35">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-400/25 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-500/30"
                    aria-hidden
                  >
                    <FiCalendar className="h-[18px] w-[18px]" strokeWidth={2.25} />
                  </span>
                  <div className="min-w-0 py-0.5">
                    <h2 className="text-base font-semibold leading-tight tracking-tight text-emerald-950 dark:text-emerald-50">
                      Upcoming exams
                    </h2>
                    <p className="mt-0.5 text-[11px] font-medium leading-snug text-emerald-800/85 dark:text-emerald-200/85">
                      Next on your calendar
                    </p>
                  </div>
                </div>
                <Link
                  to={`${STUDENT_BASE}/exams`}
                  className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-emerald-300/90 bg-white/95 px-3.5 text-xs font-semibold text-emerald-900 shadow-sm transition hover:border-emerald-500 hover:bg-emerald-50/90 dark:border-emerald-600/55 dark:bg-emerald-950/50 dark:text-emerald-50 dark:hover:border-emerald-400 dark:hover:bg-emerald-900/55"
                >
                  View all
                </Link>
              </header>
              <ul className="mt-4 space-y-3">
                {derived.upcomingExamsPreview.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-emerald-300/70 bg-white/50 px-3 py-6 text-center text-sm text-emerald-800/70 dark:border-emerald-600/40 dark:bg-emerald-950/20 dark:text-emerald-200/70">
                    No upcoming exams.
                  </li>
                ) : (
                  derived.upcomingExamsPreview.map((e) => (
                    <li
                      key={e.id}
                      className="rounded-xl border border-emerald-200/90 bg-white/80 px-3 py-3 shadow-sm dark:border-emerald-700/50 dark:bg-emerald-950/35"
                    >
                      <p className="font-medium text-slate-900 dark:text-white">{e.title || 'Exam'}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        {e.courseCode ? (
                          <span className="rounded-full bg-white px-2 py-0.5 font-medium dark:bg-slate-900">
                            {e.courseCode}
                          </span>
                        ) : null}
                        <span className="tabular-nums text-emerald-700 dark:text-emerald-300">
                          {e.examDate
                            ? format(parseISO(String(e.examDate).slice(0, 10)), 'MMM d, yyyy')
                            : '—'}
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </Card>

            <Card
              padding="p-5"
              className="relative overflow-hidden !bg-gradient-to-br from-amber-50/95 via-white/90 to-orange-50/60 border-2 border-amber-400/70 shadow-lg shadow-amber-500/15 ring-1 ring-amber-300/40 dark:from-amber-950/50 dark:via-slate-900/90 dark:to-orange-950/30 dark:border-amber-500/45 dark:shadow-amber-950/25 dark:ring-amber-500/25"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 dark:from-amber-500 dark:via-orange-500 dark:to-amber-400"
                aria-hidden
              />
              <header className="relative z-10 flex min-h-13 items-center justify-between gap-3 border-b border-amber-200/60 pb-3.5 dark:border-amber-800/35">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-900 ring-1 ring-amber-400/30 dark:bg-amber-500/20 dark:text-amber-50 dark:ring-amber-500/35"
                    aria-hidden
                  >
                    <FiClock className="h-[18px] w-[18px]" strokeWidth={2.25} />
                  </span>
                  <div className="min-w-0 py-0.5">
                    <h2 className="text-base font-semibold leading-tight tracking-tight text-amber-950 dark:text-amber-50">
                      Upcoming assignments
                    </h2>
                    <p className="mt-0.5 text-[11px] font-medium leading-snug text-amber-900/80 dark:text-amber-200/85">
                      Next deadline you still need to submit
                    </p>
                  </div>
                </div>
                <Link
                  to={`${STUDENT_BASE}/assignments`}
                  className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-amber-300/90 bg-white/95 px-3.5 text-xs font-semibold text-amber-950 shadow-sm transition hover:border-amber-500 hover:bg-amber-50/90 dark:border-amber-600/55 dark:bg-amber-950/50 dark:text-amber-50 dark:hover:border-amber-400 dark:hover:bg-amber-900/55"
                >
                  View all
                </Link>
              </header>
              <ul className="mt-4 space-y-3">
                {derived.upcomingAssignmentsPreview.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-amber-300/70 bg-white/50 px-3 py-6 text-center text-sm text-amber-900/70 dark:border-amber-600/40 dark:bg-amber-950/20 dark:text-amber-200/70">
                    No upcoming assignments.
                  </li>
                ) : (
                  derived.upcomingAssignmentsPreview.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-xl border border-amber-200/90 bg-white/80 px-3 py-3 shadow-sm dark:border-amber-700/50 dark:bg-amber-950/35"
                    >
                      <p className="font-medium text-slate-900 dark:text-white">{a.title || 'Assignment'}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        {a.courseCode ? (
                          <span className="rounded-full bg-white px-2 py-0.5 font-medium dark:bg-slate-900">
                            {a.courseCode}
                          </span>
                        ) : null}
                        <span className="tabular-nums text-amber-700 dark:text-amber-300">
                          {a.deadline ? format(new Date(a.deadline), 'MMM d, yyyy HH:mm') : '—'}
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </Card>
          </div>

        </>
      )}
    </div>
  );
}
