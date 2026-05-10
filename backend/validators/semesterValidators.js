const { body, param } = require('express-validator');

const idParam = [param('id').isInt({ min: 1 }).toInt()];

const createSemesterRules = [
  body('name').trim().notEmpty().isLength({ max: 120 }),
  body('academicYear').optional().trim().isLength({ max: 32 }),
  body('startDate').optional({ nullable: true }).isISO8601(),
  body('endDate').optional({ nullable: true }).isISO8601(),
  body('isCurrent').optional().isBoolean(),
];

module.exports = { idParam, createSemesterRules };
