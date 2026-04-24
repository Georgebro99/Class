const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRole } = require('../middleware/auth');

// Student: Dashboard
router.get('/dashboard', authenticateUser, authorizeRole(['student']), async (req, res) => {
  try {
    const enrollments = await req.db.all(
      `SELECT c.* FROM classes c 
       JOIN enrollments e ON c.id = e.class_id 
       WHERE e.user_id = ? 
       ORDER BY c.created_at DESC`,
      [req.session.user.id]
    );

    const upcomingAssignments = await req.db.all(
      `SELECT a.*, c.name as class_name FROM assignments a
       JOIN classes c ON a.class_id = c.id
       JOIN enrollments e ON c.id = e.class_id
       WHERE e.user_id = ? AND a.due_date IS NOT NULL
       ORDER BY a.due_date ASC
       LIMIT 5`,
      [req.session.user.id]
    );

    res.render('student/dashboard', {
      user: req.session.user,
      classes: enrollments,
      upcomingAssignments
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error: error.message });
  }
});

// Join class
router.get('/join', authenticateUser, authorizeRole(['student']), (req, res) => {
  res.render('student/join');
});

router.post('/join', authenticateUser, authorizeRole(['student']), async (req, res) => {
  try {
    const { classCode } = req.body;

    if (!classCode) {
      return res.render('student/join', { error: 'Class code is required' });
    }

    const classData = await req.db.get(
      'SELECT * FROM classes WHERE code = ?',
      [classCode.toUpperCase()]
    );

    if (!classData) {
      return res.render('student/join', { error: 'Invalid class code' });
    }

    const existingEnrollment = await req.db.get(
      'SELECT * FROM enrollments WHERE user_id = ? AND class_id = ?',
      [req.session.user.id, classData.id]
    );

    if (existingEnrollment) {
      return res.render('student/join', { error: 'You are already enrolled in this class' });
    }

    await req.db.run(
      'INSERT INTO enrollments (user_id, class_id) VALUES (?, ?)',
      [req.session.user.id, classData.id]
    );

    res.redirect(`/classes/${classData.id}`);
  } catch (error) {
    console.error(error);
    res.render('student/join', { error: 'Failed to join class' });
  }
});

// Submit assignment
router.post('/submit/:assignmentId', authenticateUser, authorizeRole(['student']), async (req, res) => {
  try {
    const { submissionText } = req.body;

    const assignment = await req.db.get(
      'SELECT a.*, c.id as class_id FROM assignments a JOIN classes c ON a.class_id = c.id WHERE a.id = ?',
      [req.params.assignmentId]
    );

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check enrollment
    const enrollment = await req.db.get(
      'SELECT * FROM enrollments WHERE user_id = ? AND class_id = ?',
      [req.session.user.id, assignment.class_id]
    );

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this class' });
    }

    await req.db.run(
      `INSERT INTO submissions (assignment_id, user_id, submission_text, status) 
       VALUES (?, ?, ?, 'submitted')
       ON CONFLICT(assignment_id, user_id) 
       DO UPDATE SET submission_text = ?, status = 'submitted', submitted_at = CURRENT_TIMESTAMP`,
      [req.params.assignmentId, req.session.user.id, submissionText, submissionText]
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
});

module.module = router;
