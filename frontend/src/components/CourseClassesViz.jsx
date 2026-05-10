import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { STUDENT_BASE } from '../layouts/StudentLayout';

const PERIODS = [
  { id: '7', label: '7 days' },
  { id: '14', label: '14 days' },
  { id: '28', label: '28 days' },
];

/** Normalized positions in 0–1 space (width then height). */
const VENN_LAYOUT = {
  1: [{ nx: 0.5, ny: 0.5, rBoost: 1 }],
  2: [
    { nx: 0.38, ny: 0.5, rBoost: 0.92 },
    { nx: 0.62, ny: 0.5, rBoost: 0.92 },
  ],
  3: [
    { nx: 0.5, ny: 0.36, rBoost: 0.88 },
    { nx: 0.69, ny: 0.62, rBoost: 0.88 },
    { nx: 0.31, ny: 0.62, rBoost: 0.88 },
  ],
  4: [
    { nx: 0.5, ny: 0.36, rBoost: 0.82 },
    { nx: 0.72, ny: 0.52, rBoost: 0.82 },
    { nx: 0.5, ny: 0.72, rBoost: 0.82 },
    { nx: 0.28, ny: 0.52, rBoost: 0.82 },
  ],
};

const FALLBACK_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#a855f7'];

function periodKey(id) {
  if (id === '7') return 'last7Days';
  if (id === '14') return 'last14Days';
  return 'last28Days';
}

function CourseVennCircles({ courses, width, height, hoveredId, setHoveredId, dimOthers }) {
  const n = Math.min(courses.length, 4);
  const layout = VENN_LAYOUT[n] || VENN_LAYOUT[4];
  const maxSessions = Math.max(...courses.slice(0, n).map((c) => c.sessions), 1);
  const baseR = Math.min(width, height) * 0.22;

  const circles = useMemo(() => {
    const sortedIdx = [...courses.slice(0, n).keys()].sort(
      (a, b) => courses[a].sessions - courses[b].sessions
    );
    return sortedIdx.map((courseIndex, visualOrder) => {
      const c = courses[courseIndex];
      const slot = layout[visualOrder];
      const t = Math.sqrt(c.sessions / maxSessions);
      const r = Math.max(baseR * 0.45, Math.min(baseR * 1.05, baseR * slot.rBoost * (0.42 + 0.58 * t)));
      return {
        key: c.courseId,
        cx: slot.nx * width,
        cy: slot.ny * height,
        r,
        fill: c.courseColor,
        title: c.courseTitle,
        sessions: c.sessions,
        courseId: c.courseId,
      };
    });
  }, [courses, n, maxSessions, baseR, width, height]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="max-h-[min(280px,55vw)] w-full overflow-visible"
      role="img"
      aria-label="Overlapping circles by course; overlap is visual only—each session belongs to one course."
    >
      <defs>
        <filter id="vennSoftGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g className="mix-blend-multiply opacity-[0.92] dark:mix-blend-screen dark:opacity-90">
        {circles.map((d) => (
          <circle
            key={d.key}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={d.fill}
            fillOpacity={
              hoveredId === d.courseId ? 0.66 : dimOthers ? 0.24 : 0.58
            }
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={hoveredId === d.courseId ? 2.5 : 1.25}
            className="cursor-pointer transition-[fill-opacity,stroke-width] duration-150 dark:stroke-slate-900/50"
            filter="url(#vennSoftGlow)"
            onMouseEnter={() => setHoveredId(d.courseId)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <title>
              {d.title}: {d.sessions} session{d.sessions === 1 ? '' : 's'}
            </title>
          </circle>
        ))}
      </g>
    </svg>
  );
}

export default function CourseClassesViz({ classesByCourse }) {
  const [period, setPeriod] = useState('7');
  const [hoveredId, setHoveredId] = useState(null);

  const data = classesByCourse?.[periodKey(period)] ?? [];

  const totalSessions = useMemo(() => data.reduce((s, c) => s + c.sessions, 0), [data]);

  const pieData = useMemo(
    () =>
      data.map((c, i) => ({
        name: c.courseTitle,
        value: c.sessions,
        fill: c.courseColor || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
        courseId: c.courseId,
      })),
    [data]
  );

  const vennCourses = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.sessions - a.sessions);
    return sorted.slice(0, 4);
  }, [data]);

  const extraCount = Math.max(0, data.length - 4);

  const useRingOnly = data.length > 4;

  const dimVennCircles =
    hoveredId != null && vennCourses.some((c) => c.courseId === hoveredId);

  return (
    <div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Classes logged</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Attendance by course for the range you select. Circle size reflects session count; overlap is visual only.
          </p>
        </div>
        <Link
          to={`${STUDENT_BASE}/tracker`}
          className="shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Log attendance
        </Link>
      </div>

      <div className="mt-5 flex flex-col gap-1.5">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Time range</span>
        <div
          className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-600 dark:bg-slate-800/80"
          role="group"
          aria-label="Rolling period for attendance"
        >
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                period === p.id
                  ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-6 dark:border-slate-700 dark:bg-slate-900/40">
          {data.length === 0 && (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Add courses first, then log attendance from the semester tracker to see them here.
            </p>
          )}
          {data.length > 0 && totalSessions === 0 && (
            <p className="mb-4 max-w-sm text-center text-sm text-slate-500 dark:text-slate-400">
              No sessions logged in this window—your courses still appear in the list with 0. Log attendance to fill the
              diagram.
            </p>
          )}
          {data.length > 0 && useRingOnly && totalSessions > 0 && (
            <div className="h-64 w-full max-w-sm">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="52%"
                    outerRadius="78%"
                    paddingAngle={1}
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${String(name).slice(0, 14)}${String(name).length > 14 ? '…' : ''} ${(Number(percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.courseId} fill={entry.fill} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`${v} session${v === 1 ? '' : 's'}`, 'Logged']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {data.length > 0 && useRingOnly && totalSessions === 0 && (
            <p className="max-w-sm text-center text-sm text-slate-500 dark:text-slate-400">
              The ring chart appears once at least one session is logged. Session counts by course are still listed on
              the right.
            </p>
          )}
          {data.length > 0 && !useRingOnly && (
            <div className="relative flex w-full max-w-md flex-col items-center">
              <CourseVennCircles
                courses={vennCourses}
                width={280}
                height={240}
                hoveredId={hoveredId}
                setHoveredId={setHoveredId}
                dimOthers={dimVennCircles}
              />
              {extraCount > 0 && (
                <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                  Diagram shows the four courses with the most sessions; the list includes all {data.length} courses.
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Course breakdown</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Colours follow each course. Hover a row or a circle to highlight the same course.
          </p>
          <ul className="mt-4 space-y-2.5">
            {data.length === 0 && (
              <li className="text-sm text-slate-500 dark:text-slate-400">No courses yet.</li>
            )}
            {data.map((c, i) => (
              <li
                key={c.courseId}
                className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                  hoveredId === c.courseId
                    ? 'border-indigo-300 bg-indigo-50/90 dark:border-indigo-500/50 dark:bg-indigo-950/40'
                    : 'border-slate-100 bg-white/80 dark:border-slate-800 dark:bg-slate-900/50'
                }`}
                onMouseEnter={() => setHoveredId(c.courseId)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-white dark:ring-slate-800"
                    style={{ backgroundColor: c.courseColor || FALLBACK_COLORS[i % FALLBACK_COLORS.length] }}
                  />
                  <span className="truncate font-medium text-slate-900 dark:text-white">{c.courseTitle}</span>
                </span>
                <span className="shrink-0 tabular-nums font-semibold text-slate-700 dark:text-slate-200">
                  {c.sessions}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
