const { body, param, query } = require('express-validator');

const idParam = [param('id').isInt({ min: 1 }).toInt()];

const listQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  query('search').optional().trim().isLength({ max: 200 }),
  query('sort').optional().isIn(['title', 'code', 'created_at', 'credit']),
  query('order').optional().isIn(['asc', 'desc']),
];

// HH:mm or H:mm, optional seconds (HTML time inputs vary by browser)
const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const createCourseRules = [
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('code').trim().notEmpty().isLength({ max: 64 }),
  body('instructor').optional({ values: 'falsy' }).trim().isLength({ max: 255 }),
  body('credit').optional().isFloat({ min: 0, max: 50 }),
  // null / omitted = no semester (default optional() only skips undefined, not null)
  body('semesterId').optional({ values: 'null' }).isInt({ min: 1 }),
  body('semesterLabel').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  body('weeklyClassFrequency').optional().isInt({ min: 1, max: 14 }),
  body('classDays').optional({ values: 'falsy' }).trim().isLength({ max: 255 }),
  body('classStartTime').optional({ values: 'falsy' }).matches(timeRegex).withMessage('Invalid start time'),
  body('classEndTime').optional({ values: 'falsy' }).matches(timeRegex).withMessage('Invalid end time'),
  body('room').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  body('color').optional({ values: 'falsy' }).trim().isLength({ max: 32 }),
];

const updateCourseRules = [
  body('title').optional().trim().notEmpty().isLength({ max: 255 }),
  body('code').optional().trim().notEmpty().isLength({ max: 64 }),
  body('instructor').optional({ values: 'falsy' }).trim().isLength({ max: 255 }),
  body('credit').optional().isFloat({ min: 0, max: 50 }),
  body('semesterId').optional({ values: 'null' }).isInt({ min: 1 }),
  body('semesterLabel').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  body('weeklyClassFrequency').optional().isInt({ min: 1, max: 14 }),
  body('classDays').optional({ values: 'falsy' }).trim().isLength({ max: 255 }),
  body('classStartTime').optional({ values: 'falsy' }).matches(timeRegex),
  body('classEndTime').optional({ values: 'falsy' }).matches(timeRegex),
  body('room').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  body('color').optional({ values: 'falsy' }).trim().isLength({ max: 32 }),
];

module.exports = { idParam, listQuery, createCourseRules, updateCourseRules };
