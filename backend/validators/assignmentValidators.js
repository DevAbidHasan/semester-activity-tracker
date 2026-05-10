const { body, param, query } = require('express-validator');

const idParam = [param('id').isInt({ min: 1 }).toInt()];

const listQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'submitted', 'graded', 'late']),
  query('courseId').optional().isInt({ min: 1 }),
  query('priority').optional().isIn(['low', 'medium', 'high']),
  query('sort').optional().isIn(['deadline', 'title', 'created_at', 'priority']),
  query('order').optional().isIn(['asc', 'desc']),
];

const createAssignmentRules = [
  body('courseId').isInt({ min: 1 }),
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('deadline').isISO8601().toDate(),
  body('submissionStatus').optional().isIn(['pending', 'submitted', 'graded', 'late']),
  body('marksObtained').optional({ nullable: true }).isFloat({ min: 0 }),
  body('totalMarks').optional({ nullable: true }).isFloat({ min: 0 }),
  body('notes').optional().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
];

module.exports = { idParam, listQuery, createAssignmentRules };
