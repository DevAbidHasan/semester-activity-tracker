const { body, param, query } = require('express-validator');

const idParam = [param('id').isInt({ min: 1 }).toInt()];

const listQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('q').optional().trim().isLength({ max: 200 }),
  query('category').optional().trim().isLength({ max: 120 }),
  query('sort').optional().isIn(['title', 'created_at', 'updated_at']),
  query('order').optional().isIn(['asc', 'desc']),
];

const linkUrlBody = body('linkUrl')
  .optional({ nullable: true, checkFalsy: true })
  .trim()
  .isLength({ max: 2000 })
  .custom((val) => {
    if (!val) return true;
    try {
      // eslint-disable-next-line no-new
      new URL(val);
      return true;
    } catch {
      throw new Error('Invalid URL');
    }
  });

const createNoteRules = [
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('content').notEmpty(),
  body('category').optional({ nullable: true }).trim().isLength({ max: 120 }),
  linkUrlBody,
];

const updateNoteRules = [
  body('title').optional().trim().notEmpty().isLength({ max: 255 }),
  body('content').optional().notEmpty(),
  body('category').optional({ nullable: true }).trim().isLength({ max: 120 }),
  linkUrlBody,
];

module.exports = { idParam, listQuery, createNoteRules, updateNoteRules };
