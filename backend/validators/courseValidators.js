const { body, param, query } = require('express-validator');

const idParam = [param('id').isInt({ min: 1 }).toInt()];

const listQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim().isLength({ max: 200 }),
  query('sort').optional().isIn(['title', 'code', 'created_at', 'credit']),
  query('order').optional().isIn(['asc', 'desc']),
];

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const createCourseRules = [
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('code').trim().notEmpty().isLength({ max: 64 }),
  body('instructor').optional().trim().isLength({ max: 255 }),
  body('credit').optional().isFloat({ min: 0, max: 50 }),
  body('semesterId').optional({ nullable: true }).isInt({ min: 1 }),
  body('semesterLabel').optional().trim().isLength({ max: 120 }),
  body('weeklyClassFrequency').optional().isInt({ min: 1, max: 14 }),
  body('classDays').optional().trim().isLength({ max: 255 }),
  body('classStartTime').optional().matches(timeRegex).withMessage('Invalid start time'),
  body('classEndTime').optional().matches(timeRegex).withMessage('Invalid end time'),
  body('room').optional().trim().isLength({ max: 120 }),
  body('color').optional().trim().isLength({ max: 32 }),
];

const updateCourseRules = [
  body('title').optional().trim().notEmpty().isLength({ max: 255 }),
  body('code').optional().trim().notEmpty().isLength({ max: 64 }),
  body('instructor').optional().trim().isLength({ max: 255 }),
  body('credit').optional().isFloat({ min: 0, max: 50 }),
  body('semesterId').optional({ nullable: true }).isInt({ min: 1 }),
  body('semesterLabel').optional().trim().isLength({ max: 120 }),
  body('weeklyClassFrequency').optional().isInt({ min: 1, max: 14 }),
  body('classDays').optional().trim().isLength({ max: 255 }),
  body('classStartTime').optional().matches(timeRegex),
  body('classEndTime').optional().matches(timeRegex),
  body('room').optional().trim().isLength({ max: 120 }),
  body('color').optional().trim().isLength({ max: 32 }),
];

module.exports = { idParam, listQuery, createCourseRules, updateCourseRules };
