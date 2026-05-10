const express = require('express');
const { listUsers, deleteUser, analytics } = require('../controllers/adminController');

const router = express.Router();

router.get('/analytics', analytics);
router.get('/users', listUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
