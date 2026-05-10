const express = require('express');
const ctrl = require('../controllers/assignmentController');
const { validate } = require('../middleware/validate');
const { idParam, listQuery, createAssignmentRules } = require('../validators/assignmentValidators');

const router = express.Router();

router.get('/', listQuery, validate, ctrl.list);
router.get('/:id', idParam, validate, ctrl.getById);
router.post('/', createAssignmentRules, validate, ctrl.create);
router.put('/:id', idParam, validate, ctrl.update);
router.delete('/:id', idParam, validate, ctrl.remove);

module.exports = router;
