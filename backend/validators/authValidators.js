const { body } = require('express-validator');

const registerRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').optional().trim().isLength({ max: 100 }),
  body('lastName').optional().trim().isLength({ max: 100 }),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

module.exports = { registerRules, loginRules };
