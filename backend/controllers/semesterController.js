const { pool } = require('../config/db');

async function list(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM semesters WHERE user_id = ? ORDER BY is_current DESC, start_date DESC, id DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows.map(mapRow) });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM semesters WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: mapRow(rows[0]) });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const b = req.body;
    if (b.isCurrent) {
      await pool.query('UPDATE semesters SET is_current = FALSE WHERE user_id = ?', [req.user.id]);
    }
    const [result] = await pool.query(
      `INSERT INTO semesters (user_id, name, academic_year, start_date, end_date, is_current)
       VALUES (?,?,?,?,?,?)`,
      [
        req.user.id,
        b.name,
        b.academicYear || null,
        b.startDate ? String(b.startDate).slice(0, 10) : null,
        b.endDate ? String(b.endDate).slice(0, 10) : null,
        Boolean(b.isCurrent),
      ]
    );
    const [rows] = await pool.query('SELECT * FROM semesters WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: mapRow(rows[0]) });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const [check] = await pool.query('SELECT id FROM semesters WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
    if (!check.length) return res.status(404).json({ success: false, message: 'Not found' });
    const b = req.body;
    if (b.isCurrent) {
      await pool.query('UPDATE semesters SET is_current = FALSE WHERE user_id = ? AND id != ?', [
        req.user.id,
        req.params.id,
      ]);
    }
    const map = [
      ['name', b.name],
      ['academic_year', b.academicYear],
      ['start_date', b.startDate !== undefined ? (b.startDate ? String(b.startDate).slice(0, 10) : null) : undefined],
      ['end_date', b.endDate !== undefined ? (b.endDate ? String(b.endDate).slice(0, 10) : null) : undefined],
      ['is_current', b.isCurrent !== undefined ? (b.isCurrent ? 1 : 0) : undefined],
    ];
    const fields = [];
    const vals = [];
    for (const [col, val] of map) {
      if (val !== undefined) {
        fields.push(`${col} = ?`);
        vals.push(val);
      }
    }
    if (!fields.length) return res.status(400).json({ success: false, message: 'No fields to update' });
    vals.push(req.params.id, req.user.id);
    await pool.query(`UPDATE semesters SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, vals);
    const [rows] = await pool.query('SELECT * FROM semesters WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: mapRow(rows[0]) });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const [r] = await pool.query('DELETE FROM semesters WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    next(e);
  }
}

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    academicYear: row.academic_year,
    startDate: row.start_date,
    endDate: row.end_date,
    isCurrent: Boolean(row.is_current),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { list, getById, create, update, remove };
