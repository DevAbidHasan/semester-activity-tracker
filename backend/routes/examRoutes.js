const express = require('express');
const ctrl = require('../controllers/examController');
const { validate } = require('../middleware/validate');
const { idParam, listQuery, createExamRules } = require('../validators/examValidators');

const router = express.Router();

router.get('/', listQuery, validate, ctrl.list);
router.get('/:id', idParam, validate, ctrl.getById);
router.post('/', createExamRules, validate, ctrl.create);
router.put('/:id', idParam, validate, ctrl.update);
router.delete('/:id', idParam, validate, ctrl.remove);

module.exports = router;
