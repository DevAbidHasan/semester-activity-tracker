/**
 * Shared database access — controllers import `{ pool }` from `../config/db`.
 * This module exists to satisfy the MVC `models/` folder and can grow with query helpers.
 */
const { pool } = require('../config/db');

module.exports = { pool };
