/**
 * Parse page/limit from query string with safe bounds.
 */
function getPagination(query, defaultLimit = 12) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || String(defaultLimit)), 10) || defaultLimit));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function sortClause(allowed, sort, order, defaultSort = 'created_at') {
  const col = allowed.includes(sort) ? sort : defaultSort;
  const dir = String(order || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  return { column: col, direction: dir };
}

module.exports = { getPagination, sortClause };
