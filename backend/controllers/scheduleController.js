const { pool } = require('../config/db');

const dayOrder =
  'FIELD(day_of_week,"monday","tuesday","wednesday","thursday","friday","saturday","sunday"), start_time';

async function list(req, res, next) {
  try {
    let where = 's.user_id = ?';
    const params = [req.user.id];
    if (req.query.day) {
      where += ' AND s.day_of_week = ?';
      params.push(req.query.day);
    }
    if (req.query.courseId) {
      where += ' AND s.course_id = ?';
      params.push(req.query.courseId);
    }
    const [rows] = await pool.query(
      `SELECT s.*, c.title AS course_title, c.code AS course_code, c.color AS course_color
       FROM schedules s
       JOIN courses c ON c.id = s.course_id
       WHERE ${where}
       ORDER BY ${dayOrder}`,
      params
    );
    res.json({ success: true, data: rows.map(mapRow) });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, c.title AS course_title FROM schedules s
       JOIN courses c ON c.id = s.course_id WHERE s.id = ? AND s.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: mapRow(rows[0]) });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const b = req.body;
    const [c] = await pool.query('SELECT id FROM courses WHERE id = ? AND user_id = ?', [b.courseId, req.user.id]);
    if (!c.length) return res.status(400).json({ success: false, message: 'Invalid course' });
    const [result] = await pool.query(
      `INSERT INTO schedules (user_id, course_id, day_of_week, start_time, duration_minutes, room, teacher)
       VALUES (?,?,?,?,?,?,?)`,
      [
        req.user.id,
        b.courseId,
        b.dayOfWeek,
        b.startTime,
        b.durationMinutes ?? 60,
        b.room || null,
        b.teacher || null,
      ]
    );
    const [rows] = await pool.query(
      `SELECT s.*, c.title AS course_title FROM schedules s JOIN courses c ON c.id = s.course_id WHERE s.id = ?`,
      [result.insertId]
    );
    res.status(201).json({ success: true, data: mapRow(rows[0]) });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const [check] = await pool.query('SELECT id FROM schedules WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
    if (!check.length) return res.status(404).json({ success: false, message: 'Not found' });
    const b = req.body;
    const map = [
      ['course_id', b.courseId],
      ['day_of_week', b.dayOfWeek],
      ['start_time', b.startTime],
      ['duration_minutes', b.durationMinutes],
      ['room', b.room],
      ['teacher', b.teacher],
    ];
    const fields = [];
    const vals = [];
    for (const [col, val] of map) {
      if (val !== undefined) {
        fields.push(`${col} = ?`);
        vals.push(val === '' ? null : val);
      }
    }
    if (b.courseId) {
      const [c] = await pool.query('SELECT id FROM courses WHERE id = ? AND user_id = ?', [b.courseId, req.user.id]);
      if (!c.length) return res.status(400).json({ success: false, message: 'Invalid course' });
    }
    if (!fields.length) return res.status(400).json({ success: false, message: 'No fields to update' });
    vals.push(req.params.id, req.user.id);
    await pool.query(`UPDATE schedules SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, vals);
    const [rows] = await pool.query(
      `SELECT s.*, c.title AS course_title FROM schedules s JOIN courses c ON c.id = s.course_id WHERE s.id = ?`,
      [req.params.id]
    );
    res.json({ success: true, data: mapRow(rows[0]) });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const [r] = await pool.query('DELETE FROM schedules WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    next(e);
  }
}

function mapRow(row) {
  return {
    id: row.id,
    courseId: row.course_id,
    courseTitle: row.course_title,
    courseCode: row.course_code,
    courseColor: row.course_color,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    durationMinutes: row.duration_minutes,
    room: row.room,
    teacher: row.teacher,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { list, getById, create, update, remove };
