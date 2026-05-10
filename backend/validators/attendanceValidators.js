const { body, param, query } = require('express-validator');

const idParam = [param('id').isInt({ min: 1 }).toInt()];

const listQuery = [
  query('courseId').optional().isInt({ min: 1 }),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
];

const createAttendanceRules = [
  body('courseId').isInt({ min: 1 }),
  body('sessionDate').isISO8601(),
  body('status').optional().isIn(['present', 'absent', 'excused', 'late']),
  body('notes').optional().trim().isLength({ max: 500 }),
];

module.exports = { idParam, listQuery, createAttendanceRules };
