require('dotenv').config();
const app = require('./app');
const { ensureNotesLinkColumn } = require('./utils/ensureNotesLinkColumn');

const PORT = Number(process.env.PORT) || 5000;

ensureNotesLinkColumn()
  .catch((e) => console.error('[db] ensureNotesLinkColumn failed', e))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  });
