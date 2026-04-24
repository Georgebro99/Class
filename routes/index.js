const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const classRoutes = require('./classes');
const assignmentRoutes = require('./assignments');
const announcementRoutes = require('./announcements');
const studentRoutes = require('./student');
const { authenticateUser } = require('../middleware/auth');

// Auth routes
router.use('/', authRoutes);

// Dashboard
router.get('/dashboard', authenticateUser, (req, res) => {
  const role = req.session.user.role;
  if (role === 'teacher') {
    res.redirect('/teacher/dashboard');
  } else {
    res.redirect('/student/dashboard');
  }
});

// Class routes
router.use('/classes', classRoutes);

// Assignment routes
router.use('/assignments', assignmentRoutes);

// Announcement routes
router.use('/announcements', announcementRoutes);

// Student routes
router.use('/student', studentRoutes);

// Home
router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('index');
});

module.exports = router;
