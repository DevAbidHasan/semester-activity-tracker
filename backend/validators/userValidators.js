const { body } = require('express-validator');

const updateProfileRules = [
  body('firstName').optional().trim().isLength({ max: 100 }),
  body('lastName').optional().trim().isLength({ max: 100 }),
];

const changePasswordRules = [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

module.exports = { updateProfileRules, changePasswordRules };
