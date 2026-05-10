const { pool } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');

async function updateProfile(req, res, next) {
  try {
    const { firstName, lastName } = req.body;
    const fields = [];
    const values = [];
    if (firstName !== undefined) {
      fields.push('first_name = ?');
      values.push(firstName);
    }
    if (lastName !== undefined) {
      fields.push('last_name = ?');
      values.push(lastName);
    }
    if (!fields.length) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    values.push(req.user.id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query(
      `SELECT id, email, first_name, last_name, role FROM users WHERE id = ?`,
      [req.user.id]
    );
    const u = rows[0];
    res.json({
      success: true,
      message: 'Profile updated',
      data: {
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        role: u.role,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const ok = await comparePassword(currentPassword, rows[0].password_hash);
    if (!ok) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    const hash = await hashPassword(newPassword);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ success: true, message: 'Password updated' });
  } catch (e) {
    next(e);
  }
}

module.exports = { updateProfile, changePassword };
