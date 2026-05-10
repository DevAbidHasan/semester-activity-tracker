const { body, param, query } = require('express-validator');

const idParam = [param('id').isInt({ min: 1 }).toInt()];

const listQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('courseId').optional().isInt({ min: 1 }),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('sort').optional().isIn(['exam_date', 'title', 'created_at']),
  query('order').optional().isIn(['asc', 'desc']),
];

const createExamRules = [
  body('courseId').isInt({ min: 1 }),
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('examType').optional().trim().isLength({ max: 80 }),
  body('examDate').isISO8601(),
  body('marks').optional({ nullable: true }).isFloat({ min: 0 }),
  body('gpaGrade').optional().trim().isLength({ max: 16 }),
  body('notes').optional().trim(),
];

module.exports = { idParam, listQuery, createExamRules };
