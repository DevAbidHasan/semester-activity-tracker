const { pool } = require('../config/db');
const { getPagination, sortClause } = require('../utils/pagination');

const allowedSort = ['deadline', 'title', 'created_at', 'priority'];

async function list(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query, 12);
    const { column, direction } = sortClause(allowedSort, req.query.sort, req.query.order, 'deadline');
    let where = 'a.user_id = ?';
    const params = [req.user.id];
    if (req.query.status) {
      where += ' AND a.submission_status = ?';
      params.push(req.query.status);
    }
    if (req.query.courseId) {
      where += ' AND a.course_id = ?';
      params.push(req.query.courseId);
    }
    if (req.query.priority) {
      where += ' AND a.priority = ?';
      params.push(req.query.priority);
    }
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM assignments a WHERE ${where}`,
      params
    );
    const total = countRows[0].total;
    const listParams = [...params, limit, offset];
    const orderExpr =
      column === 'priority' ? `FIELD(a.priority,'low','medium','high')` : `a.${column}`;
    const [rows] = await pool.query(
      `SELECT a.*, c.title AS course_title, c.code AS course_code, c.color AS course_color
       FROM assignments a
       JOIN courses c ON c.id = a.course_id AND c.user_id = a.user_id
       WHERE ${where}
       ORDER BY ${orderExpr} ${direction}
       LIMIT ? OFFSET ?`,
      listParams
    );
    res.json({
      success: true,
      data: rows.map(mapRow),
      meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, c.title AS course_title, c.code AS course_code FROM assignments a
       JOIN courses c ON c.id = a.course_id WHERE a.id = ? AND a.user_id = ?`,
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
      `INSERT INTO assignments (user_id, course_id, title, deadline, submission_status, marks_obtained, total_marks, notes, priority)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        req.user.id,
        b.courseId,
        b.title,
        b.deadline,
        b.submissionStatus || 'pending',
        b.marksObtained ?? null,
        b.totalMarks ?? null,
        b.notes || null,
        b.priority || 'medium',
      ]
    );
    const [rows] = await pool.query(
      `SELECT a.*, c.title AS course_title, c.code AS course_code FROM assignments a
       JOIN courses c ON c.id = a.course_id WHERE a.id = ?`,
      [result.insertId]
    );
    res.status(201).json({ success: true, data: mapRow(rows[0]) });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const [check] = await pool.query('SELECT id FROM assignments WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
    if (!check.length) return res.status(404).json({ success: false, message: 'Not found' });
    const b = req.body;
    const map = [
      ['course_id', b.courseId],
      ['title', b.title],
      ['deadline', b.deadline],
      ['submission_status', b.submissionStatus],
      ['marks_obtained', b.marksObtained],
      ['total_marks', b.totalMarks],
      ['notes', b.notes],
      ['priority', b.priority],
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
    await pool.query(`UPDATE assignments SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, vals);
    const [rows] = await pool.query(
      `SELECT a.*, c.title AS course_title, c.code AS course_code FROM assignments a
       JOIN courses c ON c.id = a.course_id WHERE a.id = ?`,
      [req.params.id]
    );
    res.json({ success: true, data: mapRow(rows[0]) });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const [r] = await pool.query('DELETE FROM assignments WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
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
    title: row.title,
    deadline: row.deadline,
    submissionStatus: row.submission_status,
    marksObtained: row.marks_obtained != null ? Number(row.marks_obtained) : null,
    totalMarks: row.total_marks != null ? Number(row.total_marks) : null,
    notes: row.notes,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { list, getById, create, update, remove };
