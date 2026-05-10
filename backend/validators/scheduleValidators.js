const { body, param, query } = require('express-validator');

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const idParam = [param('id').isInt({ min: 1 }).toInt()];

const listQuery = [
  query('day').optional().isIn(days),
  query('courseId').optional().isInt({ min: 1 }),
];

const createScheduleRules = [
  body('courseId').isInt({ min: 1 }),
  body('dayOfWeek').isIn(days),
  body('startTime').matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
  body('durationMinutes').optional().isInt({ min: 15, max: 600 }),
  body('room').optional().trim().isLength({ max: 120 }),
  body('teacher').optional().trim().isLength({ max: 255 }),
];

module.exports = { idParam, listQuery, createScheduleRules };
