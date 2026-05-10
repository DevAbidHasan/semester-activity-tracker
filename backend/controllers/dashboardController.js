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

    const [gradeRows] = await pool.query(
      `SELECT AVG(marks_obtained / NULLIF(total_marks,0) * 100) AS avg_pct
       FROM assignments
       WHERE user_id = ? AND marks_obtained IS NOT NULL AND total_marks IS NOT NULL AND total_marks > 0`,
      [userId]
    );
    const gradeAgg = gradeRows[0];
    const [examRows] = await pool.query(
      `SELECT AVG(marks) AS avg_marks FROM exams WHERE user_id = ? AND marks IS NOT NULL`,
      [userId]
    );
    const examAgg = examRows[0];

    const gpaEstimate = estimateGpa(gradeAgg.avg_pct, examAgg.avg_marks);

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
        gradeOverview: {
          assignmentAveragePercent: gradeAgg.avg_pct != null ? Math.round(gradeAgg.avg_pct * 10) / 10 : null,
          examAverageMarks: examAgg.avg_marks != null ? Math.round(examAgg.avg_marks * 10) / 10 : null,
          estimatedGpa: gpaEstimate,
        },
      },
    });
  } catch (e) {
    next(e);
  }
}

/** Simple 4.0 scale mapping from percentage (portfolio heuristic, not official). */
function estimateGpa(assignmentAvgPct, examAvgMarks) {
  let pct = assignmentAvgPct;
  if (pct == null && examAvgMarks != null) pct = Math.min(100, examAvgMarks);
  if (pct == null) return null;
  if (pct >= 93) return 4.0;
  if (pct >= 90) return 3.7;
  if (pct >= 87) return 3.3;
  if (pct >= 83) return 3.0;
  if (pct >= 80) return 2.7;
  if (pct >= 77) return 2.3;
  if (pct >= 73) return 2.0;
  if (pct >= 70) return 1.7;
  if (pct >= 67) return 1.3;
  if (pct >= 65) return 1.0;
  return Math.round((pct / 100) * 4 * 10) / 10;
}

module.exports = { stats };
