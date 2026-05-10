const { pool } = require('../config/db');
const { getPagination, sortClause } = require('../utils/pagination');

const allowedSort = ['title', 'code', 'created_at', 'credit'];

async function list(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query, 12);
    const { column, direction } = sortClause(allowedSort, req.query.sort, req.query.order, 'created_at');
    const search = req.query.search ? `%${req.query.search}%` : null;
    let where = 'user_id = ?';
    const params = [req.user.id];
    if (search) {
      where += ' AND (title LIKE ? OR code LIKE ? OR instructor LIKE ?)';
      params.push(search, search, search);
    }
    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM courses WHERE ${where}`, params);
    const total = countRows[0].total;
    params.push(limit, offset);
    const [rows] = await pool.query(
      `SELECT c.*, s.name AS semester_name
       FROM courses c
       LEFT JOIN semesters s ON s.id = c.semester_id
       WHERE ${where}
       ORDER BY c.${column} ${direction}
       LIMIT ? OFFSET ?`,
      params
    );
    res.json({
      success: true,
      data: rows.map(mapCourseRow),
      meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, s.name AS semester_name FROM courses c
       LEFT JOIN semesters s ON s.id = c.semester_id
       WHERE c.id = ? AND c.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: mapCourseRow(rows[0]) });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const b = req.body;
    const [result] = await pool.query(
      `INSERT INTO courses (
        user_id, semester_id, title, code, instructor, credit, semester_label,
        weekly_class_frequency, class_days, class_start_time, class_end_time, room, color
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        req.user.id,
        b.semesterId || null,
        b.title,
        b.code,
        b.instructor || null,
        b.credit ?? 3,
        b.semesterLabel || null,
        b.weeklyClassFrequency ?? 1,
        b.classDays || null,
        b.classStartTime || null,
        b.classEndTime || null,
        b.room || null,
        b.color || '#6366f1',
      ]
    );
    const [rows] = await pool.query('SELECT * FROM courses WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: mapCourseRow(rows[0]) });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const [check] = await pool.query('SELECT id FROM courses WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
    if (!check.length) return res.status(404).json({ success: false, message: 'Course not found' });
    const b = req.body;
    const fields = [];
    const vals = [];
    const map = [
      ['title', b.title],
      ['code', b.code],
      ['instructor', b.instructor],
      ['credit', b.credit],
      ['semester_id', b.semesterId],
      ['semester_label', b.semesterLabel],
      ['weekly_class_frequency', b.weeklyClassFrequency],
      ['class_days', b.classDays],
      ['class_start_time', b.classStartTime],
      ['class_end_time', b.classEndTime],
      ['room', b.room],
      ['color', b.color],
    ];
    for (const [col, val] of map) {
      if (val !== undefined) {
        fields.push(`${col} = ?`);
        vals.push(val === '' ? null : val);
      }
    }
    if (!fields.length) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    vals.push(req.params.id, req.user.id);
    await pool.query(`UPDATE courses SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, vals);
    const [rows] = await pool.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: mapCourseRow(rows[0]) });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const [r] = await pool.query('DELETE FROM courses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course deleted' });
  } catch (e) {
    next(e);
  }
}

function mapCourseRow(row) {
  return {
    id: row.id,
    semesterId: row.semester_id,
    semesterName: row.semester_name || null,
    title: row.title,
    code: row.code,
    instructor: row.instructor,
    credit: Number(row.credit),
    semesterLabel: row.semester_label,
    weeklyClassFrequency: row.weekly_class_frequency,
    classDays: row.class_days,
    classStartTime: row.class_start_time,
    classEndTime: row.class_end_time,
    room: row.room,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { list, getById, create, update, remove };
