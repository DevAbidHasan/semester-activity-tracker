const { pool } = require('../config/db');

/** Parse YYYY-MM-DD as UTC noon so progress math does not shift with server timezone. */
function parseUtcDateOnly(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const mo = value.getMonth() + 1;
    const d = value.getDate();
    return new Date(Date.UTC(y, mo - 1, d, 12, 0, 0));
  }
  const s = String(value).trim().slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0));
}

function addCalendarDaysUtc(date, deltaDays) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d;
}

/** When only one boundary exists, assume a ~17-week term for a reasonable progress curve. */
const DEFAULT_TERM_DAYS = 119;

/**
 * @returns {{ percent: number|null, meta: { totalDays: number, elapsedDays: number, mode: string }|null }}
 */
function computeSemesterProgress(sem) {
  if (!sem) return { percent: null, meta: null };

  const today = parseUtcDateOnly(new Date().toISOString().slice(0, 10));
  if (!today) return { percent: null, meta: null };

  const startRaw = parseUtcDateOnly(sem.start_date);
  const endRaw = parseUtcDateOnly(sem.end_date);

  if (startRaw && endRaw) {
    if (endRaw.getTime() < startRaw.getTime()) {
      return { percent: null, meta: null };
    }
    const totalMs = endRaw.getTime() - startRaw.getTime();
    const elapsedMs = today.getTime() - startRaw.getTime();
    const doneMs = Math.min(Math.max(elapsedMs, 0), totalMs <= 0 ? 0 : totalMs);
    const percent =
      totalMs > 0
        ? Math.round((doneMs / totalMs) * 1000) / 10
        : 100;
    const totalDays = Math.max(1, Math.round(totalMs / 86400000));
    const elapsedDays = Math.min(Math.max(Math.round(doneMs / 86400000), 0), totalDays);
    return {
      percent: Math.min(100, Math.max(0, percent)),
      meta: {
        mode: 'range',
        totalDays,
        elapsedDays,
      },
    };
  }

  if (startRaw && !endRaw) {
    const elapsedDays = Math.max(0, Math.round((today.getTime() - startRaw.getTime()) / 86400000));
    const pct = Math.min(100, (elapsedDays / DEFAULT_TERM_DAYS) * 100);
    return {
      percent: Math.round(pct * 10) / 10,
      meta: {
        mode: 'start-only',
        totalDays: DEFAULT_TERM_DAYS,
        elapsedDays: Math.min(elapsedDays, DEFAULT_TERM_DAYS),
      },
    };
  }

  if (!startRaw && endRaw) {
    const impliedStart = addCalendarDaysUtc(endRaw, -DEFAULT_TERM_DAYS);
    const totalMs = endRaw.getTime() - impliedStart.getTime();
    const elapsedMs = today.getTime() - impliedStart.getTime();
    const doneMs = Math.min(Math.max(elapsedMs, 0), Math.max(totalMs, 1));
    const percent = Math.round((doneMs / Math.max(totalMs, 1)) * 1000) / 10;
    return {
      percent: Math.min(100, Math.max(0, percent)),
      meta: {
        mode: 'end-only',
        totalDays: Math.max(1, Math.round(totalMs / 86400000)),
        elapsedDays: Math.round(doneMs / 86400000),
      },
    };
  }

  return { percent: null, meta: null };
}

/**
 * Aggregated semester tracker stats for the authenticated user.
 */
async function stats(req, res, next) {
  try {
    const userId = req.user.id;

    const [semRows] = await pool.query(
      `SELECT * FROM semesters WHERE user_id = ? AND is_current = TRUE LIMIT 1`,
      [userId]
    );
    const sem = semRows[0];

    const { percent: semesterProgress, meta: semesterProgressMeta } = computeSemesterProgress(sem);

    const [assignCountRows] = await pool.query(
      `SELECT
         SUM(submission_status IN ('submitted','graded')) AS completed,
         SUM(submission_status = 'pending') AS pending,
         COUNT(*) AS total
       FROM assignments WHERE user_id = ?`,
      [userId]
    );
    const assignCounts = assignCountRows[0];

    const [upcomingExams] = await pool.query(
      `SELECT e.id, e.title, e.exam_date, e.exam_type, c.title AS course_title, c.color AS course_color
       FROM exams e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = ? AND e.exam_date >= CURDATE()
       ORDER BY e.exam_date ASC
       LIMIT 5`,
      [userId]
    );

    const [attRows] = await pool.query(
      `SELECT COUNT(*) AS t, SUM(status IN ('present','late')) AS p FROM attendance WHERE user_id = ?`,
      [userId]
    );
    const att = attRows[0];
    const attTotal = Number(att.t) || 0;
    const attPct = attTotal ? Math.round(((Number(att.p) || 0) / attTotal) * 1000) / 10 : null;

    const [creditRows] = await pool.query(
      `SELECT COALESCE(SUM(credit),0) AS total_credits, COUNT(*) AS course_count FROM courses WHERE user_id = ?`,
      [userId]
    );
    const credits = creditRows[0];

    const [classWindowRows] = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN session_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) THEN 1 ELSE 0 END), 0) AS last7,
         COALESCE(SUM(CASE WHEN session_date >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) THEN 1 ELSE 0 END), 0) AS last14,
         COUNT(*) AS last28
       FROM attendance
       WHERE user_id = ?
         AND session_date >= DATE_SUB(CURDATE(), INTERVAL 27 DAY)
         AND session_date <= CURDATE()`,
      [userId]
    );
    const cw = classWindowRows[0] || { last7: 0, last14: 0, last28: 0 };

    /** Every course for the user, with session counts in the window (0 if none logged). */
    const courseSessionsSql = (intervalDays) =>
      pool.query(
        `SELECT c.id AS course_id, c.title AS course_title, c.color AS course_color,
                COALESCE(COUNT(a.id), 0) AS session_count
         FROM courses c
         LEFT JOIN attendance a
           ON a.course_id = c.id
           AND a.user_id = c.user_id
           AND a.session_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
           AND a.session_date <= CURDATE()
         WHERE c.user_id = ?
         GROUP BY c.id, c.title, c.color
         ORDER BY session_count DESC, c.title ASC`,
        [intervalDays, userId]
      );

    const mapCourseRows = (rows) =>
      rows.map((r) => ({
        courseId: r.course_id,
        courseTitle: r.course_title,
        courseColor: r.course_color && /^#[0-9A-Fa-f]{6}$/i.test(r.course_color) ? r.course_color : '#6366f1',
        sessions: Number(r.session_count) || 0,
      }));

    const [[by7], [by14], [by28]] = await Promise.all([
      courseSessionsSql(6),
      courseSessionsSql(13),
      courseSessionsSql(27),
    ]);

    const dateOnlyField = (v) => {
      if (v == null || v === '') return null;
      if (v instanceof Date && !Number.isNaN(v.getTime())) {
        const y = v.getFullYear();
        const mo = v.getMonth() + 1;
        const d = v.getDate();
        return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
      const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(v).trim());
      return m ? m[1] : null;
    };

    res.json({
      success: true,
      data: {
        currentSemester: sem
          ? {
              id: sem.id,
              name: sem.name,
              startDate: dateOnlyField(sem.start_date),
              endDate: dateOnlyField(sem.end_date),
            }
          : null,
        semesterProgressPercent: semesterProgress,
        semesterProgressMeta: semesterProgressMeta,
        assignments: {
          total: Number(assignCounts.total) || 0,
          completed: Number(assignCounts.completed) || 0,
          pending: Number(assignCounts.pending) || 0,
        },
        upcomingExams: upcomingExams.map((e) => ({
          id: e.id,
          title: e.title,
          examDate: e.exam_date,
          examType: e.exam_type,
          courseTitle: e.course_title,
          courseColor: e.course_color,
        })),
        attendancePercentage: attPct,
        credits: {
          total: Number(credits.total_credits) || 0,
          courseCount: Number(credits.course_count) || 0,
        },
        classesHeld: {
          totalLast7Days: Number(cw.last7) || 0,
          totalLast14Days: Number(cw.last14) || 0,
          totalLast28Days: Number(cw.last28) || 0,
        },
        classesByCourse: {
          last7Days: mapCourseRows(by7),
          last14Days: mapCourseRows(by14),
          last28Days: mapCourseRows(by28),
        },
      },
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { stats };
