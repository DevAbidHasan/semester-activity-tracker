const { pool } = require('../config/db');

async function list(req, res, next) {
  try {
    let where = 'a.user_id = ?';
    const params = [req.user.id];
    if (req.query.courseId) {
      where += ' AND a.course_id = ?';
      params.push(req.query.courseId);
    }
    if (req.query.from) {
      where += ' AND a.session_date >= ?';
      params.push(req.query.from.slice(0, 10));
    }
    if (req.query.to) {
      where += ' AND a.session_date <= ?';
      params.push(req.query.to.slice(0, 10));
    }
    const [rows] = await pool.query(
      `SELECT a.*, c.title AS course_title, c.code AS course_code
       FROM attendance a
       JOIN courses c ON c.id = a.course_id
       WHERE ${where}
       ORDER BY a.session_date DESC`,
      params
    );
    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        courseId: r.course_id,
        courseTitle: r.course_title,
        courseCode: r.course_code,
        sessionDate: r.session_date,
        status: r.status,
        notes: r.notes,
        createdAt: r.created_at,
      })),
    });
  } catch (e) {
    next(e);
  }
}

async function summary(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT
         COUNT(*) AS total_sessions,
         SUM(status = 'present') AS present_count,
         SUM(status = 'late') AS late_count,
         SUM(status = 'absent') AS absent_count
       FROM attendance WHERE user_id = ?`,
      [req.user.id]
    );
    const r = rows[0];
    const total = Number(r.total_sessions) || 0;
    const present = Number(r.present_count) + Number(r.late_count || 0);
    const pct = total ? Math.round((present / total) * 1000) / 10 : 0;
    res.json({
      success: true,
      data: {
        totalSessions: total,
        presentCount: Number(r.present_count) + Number(r.late_count || 0),
        absentCount: Number(r.absent_count),
        lateCount: Number(r.late_count),
        attendancePercentage: pct,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const b = req.body;
    const [c] = await pool.query('SELECT id FROM courses WHERE id = ? AND user_id = ?', [b.courseId, req.user.id]);
    if (!c.length) return res.status(400).json({ success: false, message: 'Invalid course' });
    const sessionDate = String(b.sessionDate).slice(0, 10);
    await pool.query(
      `INSERT INTO attendance (user_id, course_id, session_date, status, notes)
       VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes), updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, b.courseId, sessionDate, b.status || 'present', b.notes || null]
    );
    const [rows] = await pool.query(
      `SELECT a.*, c.title AS course_title FROM attendance a
       JOIN courses c ON c.id = a.course_id
       WHERE a.user_id = ? AND a.course_id = ? AND a.session_date = ?`,
      [req.user.id, b.courseId, sessionDate]
    );
    res.status(201).json({
      success: true,
      data: {
        id: rows[0].id,
        courseId: rows[0].course_id,
        courseTitle: rows[0].course_title,
        sessionDate: rows[0].session_date,
        status: rows[0].status,
        notes: rows[0].notes,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const [check] = await pool.query('SELECT id FROM attendance WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
    if (!check.length) return res.status(404).json({ success: false, message: 'Not found' });
    const b = req.body;
    const fields = [];
    const vals = [];
    if (b.sessionDate !== undefined) {
      fields.push('session_date = ?');
      vals.push(String(b.sessionDate).slice(0, 10));
    }
    if (b.status !== undefined) {
      fields.push('status = ?');
      vals.push(b.status);
    }
    if (b.notes !== undefined) {
      fields.push('notes = ?');
      vals.push(b.notes || null);
    }
    if (!fields.length) return res.status(400).json({ success: false, message: 'No fields to update' });
    vals.push(req.params.id, req.user.id);
    await pool.query(`UPDATE attendance SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, vals);
    const [rows] = await pool.query(
      `SELECT a.*, c.title AS course_title FROM attendance a JOIN courses c ON c.id = a.course_id WHERE a.id = ?`,
      [req.params.id]
    );
    res.json({
      success: true,
      data: {
        id: rows[0].id,
        courseId: rows[0].course_id,
        courseTitle: rows[0].course_title,
        sessionDate: rows[0].session_date,
        status: rows[0].status,
        notes: rows[0].notes,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const [r] = await pool.query('DELETE FROM attendance WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, summary, create, update, remove };
