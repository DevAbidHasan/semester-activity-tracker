const { pool } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

async function register(req, res, next) {
  try {
    const { email, password, firstName = '', lastName = '' } = req.body;
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    const passwordHash = await hashPassword(password);
    const [result] = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES (?, ?, ?, ?, 'user')`,
      [email, passwordHash, firstName, lastName]
    );
    const userId = result.insertId;
    const token = signToken({ id: userId, email, role: 'user' });
    return res.status(201).json({
      success: true,
      message: 'Account created',
      data: {
        token,
        user: { id: userId, email, firstName, lastName, role: 'user' },
      },
    });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = ?`,
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const user = rows[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is disabled' });
    }
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
      },
    });
  } catch (e) {
    next(e);
  }
}

async function me(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ? AND is_active = 1`,
      [req.user.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const u = rows[0];
    res.json({
      success: true,
      data: {
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        role: u.role,
        createdAt: u.created_at,
      },
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login, me };
