const { pool } = require('../config/db');

/**
 * Existing databases may predate the notes.link_url column. Add it once if missing
 * so GET /notes and related queries do not fail.
 */
async function ensureNotesLinkColumn() {
  try {
    const [rows] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notes' AND COLUMN_NAME = 'link_url'`
    );
    if (!rows.length) {
      await pool.query('ALTER TABLE notes ADD COLUMN link_url VARCHAR(2000) NULL AFTER category');
      console.log('[db] Added column notes.link_url');
    }
  } catch (e) {
    console.error('[db] ensureNotesLinkColumn:', e.message);
  }
}

module.exports = { ensureNotesLinkColumn };
