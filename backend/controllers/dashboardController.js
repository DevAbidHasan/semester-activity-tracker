const { pool } = require('../config/db');

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

    let semesterProgress = null;
    if (sem && sem.start_date && sem.end_date) {
      const start = new Date(sem.start_date);
      const end = new Date(sem.end_date);
      const now = new Date();
      const total = end - start;
      const done = Math.min(Math.max(now - start, 0), total);
      semesterProgress =
        total > 0 ? Math.round((done / total) * 1000) / 10 : sem.is_current ? 100 : 0;
    }

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

    res.json({
      success: true,
      data: {
        currentSemester: sem ? { id: sem.id, name: sem.name, startDate: sem.start_date, endDate: sem.end_date } : null,
        semesterProgressPercent: semesterProgress,
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
