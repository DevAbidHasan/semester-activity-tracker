const { pool } = require('../config/db');
const { getPagination, sortClause } = require('../utils/pagination');

const allowedSort = ['title', 'created_at', 'updated_at'];

/** MySQL ER_BAD_FIELD_ERROR — e.g. notes.link_url missing on older DBs */
function isMissingLinkUrlColumnError(e) {
  return e && (e.errno === 1054 || e.code === 'ER_BAD_FIELD_ERROR') && String(e.sqlMessage || '').includes('link_url');
}

async function list(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query, 12);
    const { column, direction } = sortClause(allowedSort, req.query.sort, req.query.order, 'updated_at');
    let where = 'user_id = ?';
    const params = [req.user.id];
    if (req.query.category) {
      where += ' AND category = ?';
      params.push(req.query.category);
    }
    if (req.query.q) {
      where += ' AND (title LIKE ? OR content LIKE ?)';
      const q = `%${req.query.q}%`;
      params.push(q, q);
    }
    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM notes WHERE ${where}`, params);
    const total = countRows[0].total;
    const listParams = [...params, limit, offset];
    let rows;
    try {
      const [r] = await pool.query(
        `SELECT id, title, LEFT(content, 200) AS excerpt, category, link_url, created_at, updated_at
         FROM notes WHERE ${where}
         ORDER BY ${column} ${direction}
         LIMIT ? OFFSET ?`,
        listParams
      );
      rows = r;
    } catch (e) {
      if (!isMissingLinkUrlColumnError(e)) throw e;
      const [r] = await pool.query(
        `SELECT id, title, LEFT(content, 200) AS excerpt, category, created_at, updated_at
         FROM notes WHERE ${where}
         ORDER BY ${column} ${direction}
         LIMIT ? OFFSET ?`,
        listParams
      );
      rows = r;
    }
    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        title: r.title,
        excerpt: r.excerpt,
        category: r.category,
        linkUrl: r.link_url ?? null,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
      meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM notes WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    const n = rows[0];
    res.json({
      success: true,
      data: {
        id: n.id,
        title: n.title,
        content: n.content,
        category: n.category,
        linkUrl: n.link_url != null ? n.link_url : null,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const b = req.body;
    let result;
    try {
      [result] = await pool.query(
        `INSERT INTO notes (user_id, title, content, category, link_url) VALUES (?,?,?,?,?)`,
        [req.user.id, b.title, b.content, b.category || null, b.linkUrl || null]
      );
    } catch (e) {
      if (!isMissingLinkUrlColumnError(e)) throw e;
      [result] = await pool.query(
        `INSERT INTO notes (user_id, title, content, category) VALUES (?,?,?,?)`,
        [req.user.id, b.title, b.content, b.category || null]
      );
    }
    const [rows] = await pool.query('SELECT * FROM notes WHERE id = ?', [result.insertId]);
    const n = rows[0];
    res.status(201).json({
      success: true,
      data: {
        id: n.id,
        title: n.title,
        content: n.content,
        category: n.category,
        linkUrl: n.link_url != null ? n.link_url : null,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const [check] = await pool.query('SELECT id FROM notes WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
    if (!check.length) return res.status(404).json({ success: false, message: 'Not found' });
    const b = req.body;
    const map = [
      ['title', b.title],
      ['content', b.content],
      ['category', b.category],
      ['link_url', b.linkUrl],
    ];
    const fields = [];
    const vals = [];
    for (const [col, val] of map) {
      if (val !== undefined) {
        fields.push(`${col} = ?`);
        const v =
          val === '' && (col === 'category' || col === 'link_url')
            ? null
            : val;
        vals.push(v);
      }
    }
    if (!fields.length) return res.status(400).json({ success: false, message: 'No fields to update' });
    vals.push(req.params.id, req.user.id);
    try {
      await pool.query(`UPDATE notes SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, vals);
    } catch (e) {
      if (!isMissingLinkUrlColumnError(e)) throw e;
      const mapNoLink = map.filter(([col]) => col !== 'link_url');
      const fields2 = [];
      const vals2 = [];
      for (const [col, val] of mapNoLink) {
        if (val !== undefined) {
          fields2.push(`${col} = ?`);
          const v = val === '' && col === 'category' ? null : val;
          vals2.push(v);
        }
      }
      if (!fields2.length) return res.status(400).json({ success: false, message: 'No fields to update' });
      vals2.push(req.params.id, req.user.id);
      await pool.query(`UPDATE notes SET ${fields2.join(', ')} WHERE id = ? AND user_id = ?`, vals2);
    }
    const [rows] = await pool.query('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    const n = rows[0];
    res.json({
      success: true,
      data: {
        id: n.id,
        title: n.title,
        content: n.content,
        category: n.category,
        linkUrl: n.link_url != null ? n.link_url : null,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const [r] = await pool.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    next(e);
  }
}

/** Distinct categories for filters */
async function categories(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT category FROM notes WHERE user_id = ? AND category IS NOT NULL AND category != '' ORDER BY category`,
      [req.user.id]
    );
    res.json({ success: true, data: rows.map((r) => r.category) });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, getById, create, update, remove, categories };
