const { validationResult } = require('express-validator');

/**
 * Wraps express-validator results into a 400 JSON response.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array({ onlyFirstError: false }),
    });
  }
  next();
}

module.exports = { validate };
