const { pool } = require('../config/db');
const { getPagination } = require('../utils/pagination');

async function listUsers(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query, 15);
    let where = '1=1';
    const params = [];
    if (req.query.q) {
      where += ' AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      const q = `%${req.query.q}%`;
      params.push(q, q, q);
    }
    if (req.query.role === 'admin' || req.query.role === 'user') {
      where += ' AND role = ?';
      params.push(req.query.role);
    }
    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM users WHERE ${where}`, params);
    const total = countRows[0].total;
    const listParams = [...params, limit, offset];
    const [rows] = await pool.query(
      `SELECT id, email, first_name, last_name, role, is_active, last_login_at, created_at
       FROM users WHERE ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      listParams
    );
    res.json({
      success: true,
      data: rows.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        role: u.role,
        isActive: Boolean(u.is_active),
        lastLoginAt: u.last_login_at,
        createdAt: u.created_at,
      })),
      meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (e) {
    next(e);
  }
}

async function deleteUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account' });
    }
    const [r] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    if (!r.affectedRows) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (e) {
    next(e);
  }
}

async function analytics(req, res, next) {
  try {
    const [totalRows] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM users WHERE last_login_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS active_users,
        (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS new_users_week,
        (SELECT COUNT(*) FROM courses) AS total_courses,
        (SELECT COUNT(*) FROM assignments) AS total_assignments,
        (SELECT COUNT(*) FROM exams) AS total_exams,
        (SELECT COUNT(*) FROM notes) AS total_notes
    `);
    const totals = totalRows[0];
    const [recent] = await pool.query(
      `SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC LIMIT 8`
    );
    res.json({
      success: true,
      data: {
        totalUsers: Number(totals.total_users),
        activeUsers30d: Number(totals.active_users),
        registeredLast7Days: Number(totals.new_users_week),
        totalCourses: Number(totals.total_courses),
        totalAssignments: Number(totals.total_assignments),
        totalExams: Number(totals.total_exams),
        totalNotes: Number(totals.total_notes),
        recentUsers: recent.map((u) => ({
          id: u.id,
          email: u.email,
          firstName: u.first_name,
          lastName: u.last_name,
          role: u.role,
          createdAt: u.created_at,
        })),
      },
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { listUsers, deleteUser, analytics };
