const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerRules, loginRules } = require('../validators/authValidators');

const router = express.Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', authenticate, me);

module.exports = router;
