const express = require('express');
const ctrl = require('../controllers/attendanceController');
const { validate } = require('../middleware/validate');
const { idParam, listQuery, createAttendanceRules } = require('../validators/attendanceValidators');

const router = express.Router();

router.get('/summary', ctrl.summary);
router.get('/', listQuery, validate, ctrl.list);
router.post('/', createAttendanceRules, validate, ctrl.create);
router.put('/:id', idParam, validate, ctrl.update);
router.delete('/:id', idParam, validate, ctrl.remove);

module.exports = router;
