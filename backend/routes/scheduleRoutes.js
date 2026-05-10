const express = require('express');
const ctrl = require('../controllers/scheduleController');
const { validate } = require('../middleware/validate');
const { idParam, listQuery, createScheduleRules } = require('../validators/scheduleValidators');

const router = express.Router();

router.get('/', listQuery, validate, ctrl.list);
router.get('/:id', idParam, validate, ctrl.getById);
router.post('/', createScheduleRules, validate, ctrl.create);
router.put('/:id', idParam, validate, ctrl.update);
router.delete('/:id', idParam, validate, ctrl.remove);

module.exports = router;
