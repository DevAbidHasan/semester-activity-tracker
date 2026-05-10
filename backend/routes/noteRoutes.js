const express = require('express');
const ctrl = require('../controllers/noteController');
const { validate } = require('../middleware/validate');
const { idParam, listQuery, createNoteRules } = require('../validators/noteValidators');

const router = express.Router();

router.get('/categories', ctrl.categories);
router.get('/', listQuery, validate, ctrl.list);
router.get('/:id', idParam, validate, ctrl.getById);
router.post('/', createNoteRules, validate, ctrl.create);
router.put('/:id', idParam, validate, ctrl.update);
router.delete('/:id', idParam, validate, ctrl.remove);

module.exports = router;
