const { verifyToken } = require('../utils/jwt');

/**
 * Verifies JWT from Authorization: Bearer <token>
 * Attaches req.user = { id, email, role }
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  const token = header.slice(7);
  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };
