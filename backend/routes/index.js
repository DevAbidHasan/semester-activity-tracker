const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const courseRoutes = require('./courseRoutes');
const assignmentRoutes = require('./assignmentRoutes');
const examRoutes = require('./examRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const noteRoutes = require('./noteRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const semesterRoutes = require('./semesterRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Semester Tracker API', version: '1.0.0' });
});

router.use('/auth', authRoutes);

router.use('/users', authenticate, userRoutes);
router.use('/courses', authenticate, courseRoutes);
router.use('/assignments', authenticate, assignmentRoutes);
router.use('/exams', authenticate, examRoutes);
router.use('/schedules', authenticate, scheduleRoutes);
router.use('/notes', authenticate, noteRoutes);
router.use('/attendance', authenticate, attendanceRoutes);
router.use('/semesters', authenticate, semesterRoutes);
router.use('/dashboard', authenticate, dashboardRoutes);

router.use('/admin', authenticate, requireAdmin, adminRoutes);

module.exports = router;
