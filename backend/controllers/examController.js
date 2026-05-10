const { pool } = require('../config/db');
const { getPagination, sortClause } = require('../utils/pagination');

const allowedSort = ['exam_date', 'title', 'created_at'];

async function list(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query, 12);
    const { column, direction } = sortClause(allowedSort, req.query.sort, req.query.order, 'exam_date');
    let where = 'e.user_id = ?';
    const params = [req.user.id];
    if (req.query.courseId) {
      where += ' AND e.course_id = ?';
      params.push(req.query.courseId);
    }
    if (req.query.from) {
      where += ' AND e.exam_date >= ?';
      params.push(req.query.from.slice(0, 10));
    }
    if (req.query.to) {
      where += ' AND e.exam_date <= ?';
      params.push(req.query.to.slice(0, 10));
    }
    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM exams e WHERE ${where}`, params);
    const total = countRows[0].total;
    const listParams = [...params, limit, offset];
    const [rows] = await pool.query(
      `SELECT e.*, c.title AS course_title, c.code AS course_code, c.color AS course_color
       FROM exams e
       JOIN courses c ON c.id = e.course_id
       WHERE ${where}
       ORDER BY e.${column} ${direction}
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
      `SELECT e.*, c.title AS course_title FROM exams e
       JOIN courses c ON c.id = e.course_id WHERE e.id = ? AND e.user_id = ?`,
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
    const examDate = String(b.examDate).slice(0, 10);
    const [result] = await pool.query(
      `INSERT INTO exams (user_id, course_id, title, exam_type, exam_date, marks, gpa_grade, notes)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        req.user.id,
        b.courseId,
        b.title,
        b.examType || 'midterm',
        examDate,
        b.marks ?? null,
        null,
        b.notes || null,
      ]
    );
    const [rows] = await pool.query(
      `SELECT e.*, c.title AS course_title FROM exams e JOIN courses c ON c.id = e.course_id WHERE e.id = ?`,
      [result.insertId]
    );
    res.status(201).json({ success: true, data: mapRow(rows[0]) });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const [check] = await pool.query('SELECT id FROM exams WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
    if (!check.length) return res.status(404).json({ success: false, message: 'Not found' });
    const b = req.body;
    const map = [
      ['course_id', b.courseId],
      ['title', b.title],
      ['exam_type', b.examType],
      ['exam_date', b.examDate ? String(b.examDate).slice(0, 10) : undefined],
      ['marks', b.marks],
      ['gpa_grade', b.gpaGrade],
      ['notes', b.notes],
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
    await pool.query(`UPDATE exams SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, vals);
    const [rows] = await pool.query(
      `SELECT e.*, c.title AS course_title FROM exams e JOIN courses c ON c.id = e.course_id WHERE e.id = ?`,
      [req.params.id]
    );
    res.json({ success: true, data: mapRow(rows[0]) });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const [r] = await pool.query('DELETE FROM exams WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
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
    examType: row.exam_type,
    examDate: row.exam_date,
    marks: row.marks != null ? Number(row.marks) : null,
    gpaGrade: row.gpa_grade,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { list, getById, create, update, remove };
