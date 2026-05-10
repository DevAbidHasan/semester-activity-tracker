const express = require('express');
const { updateProfile, changePassword } = require('../controllers/userController');
const { validate } = require('../middleware/validate');
const { updateProfileRules, changePasswordRules } = require('../validators/userValidators');

const router = express.Router();

router.put('/profile', updateProfileRules, validate, updateProfile);
router.put('/password', changePasswordRules, validate, changePassword);

module.exports = router;
