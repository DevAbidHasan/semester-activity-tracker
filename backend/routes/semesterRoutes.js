const express = require('express');
const ctrl = require('../controllers/semesterController');
const { validate } = require('../middleware/validate');
const { idParam, createSemesterRules } = require('../validators/semesterValidators');

const router = express.Router();

router.get('/', ctrl.list);
router.get('/:id', idParam, validate, ctrl.getById);
router.post('/', createSemesterRules, validate, ctrl.create);
router.put('/:id', idParam, validate, ctrl.update);
router.delete('/:id', idParam, validate, ctrl.remove);

module.exports = router;
