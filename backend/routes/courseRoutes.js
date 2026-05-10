const express = require('express');
const ctrl = require('../controllers/courseController');
const { validate } = require('../middleware/validate');
const { idParam, listQuery, createCourseRules, updateCourseRules } = require('../validators/courseValidators');

const router = express.Router();

router.get('/', listQuery, validate, ctrl.list);
router.get('/:id', idParam, validate, ctrl.getById);
router.post('/', createCourseRules, validate, ctrl.create);
router.put('/:id', [...idParam, ...updateCourseRules], validate, ctrl.update);
router.delete('/:id', idParam, validate, ctrl.remove);

module.exports = router;
