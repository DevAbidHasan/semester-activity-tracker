/**
 * Centralized error handler — keeps controllers thin.
 */
function notFound(req, res, next) {
  res.status(404);
  const err = new Error(`Not found: ${req.originalUrl}`);
  next(err);
}

function errorHandler(err, req, res, next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV === 'development' && err.stack ? { stack: err.stack } : {}),
  });
}

module.exports = { notFound, errorHandler };
