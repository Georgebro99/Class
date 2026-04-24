const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRole } = require('../middleware/auth');

// Teacher: Create assignment page
router.get('/create/:classId', authenticateUser, authorizeRole(['teacher']), async (req, res) => {
  try {
    const classData = await req.db.get(
      'SELECT * FROM classes WHERE id = ? AND teacher_id = ?',
      [req.params.classId, req.session.user.id]
    );

    if (!classData) {
      return res.status(404).render('404');
    }

    res.render('assignments/create', { class: classData });
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error: error.message });
  }
});

// Teacher: Create assignment
router.post('/create/:classId', authenticateUser, authorizeRole(['teacher']), async (req, res) => {
  try {
    const { title, description, dueDate, maxPoints } = req.body;

    if (!title) {
      const classData = await req.db.get('SELECT * FROM classes WHERE id = ?', [req.params.classId]);
      return res.render('assignments/create', { class: classData, error: 'Title is required' });
    }

    await req.db.run(
      'INSERT INTO assignments (class_id, title, description, due_date, max_points) VALUES (?, ?, ?, ?, ?)',
      [req.params.classId, title, description, dueDate || null, maxPoints || 100]
    );

    res.redirect(`/classes/${req.params.classId}`);
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error: error.message });
  }
});

// View assignment
router.get('/:assignmentId', authenticateUser, async (req, res) => {
  try {
    const assignment = await req.db.get(
      'SELECT a.*, c.id as class_id FROM assignments a JOIN classes c ON a.class_id = c.id WHERE a.id = ?',
      [req.params.assignmentId]
    );

    if (!assignment) {
      return res.status(404).render('404');
    }

    // Check access
    const isTeacher = assignment.teacher_id === req.session.user.id;
    const enrollment = await req.db.get(
      'SELECT * FROM enrollments WHERE user_id = ? AND class_id = ?',
      [req.session.user.id, assignment.class_id]
    );

    if (!isTeacher && !enrollment && req.session.user.role !== 'teacher') {
      return res.status(403).render('403');
    }

    const classData = await req.db.get('SELECT * FROM classes WHERE id = ?', [assignment.class_id]);
    const submissions = await req.db.all(
      'SELECT s.*, u.first_name, u.last_name FROM submissions s JOIN users u ON s.user_id = u.id WHERE s.assignment_id = ?',
      [req.params.assignmentId]
    );

    res.render('assignments/view', {
      assignment,
      class: classData,
      submissions,
      isTeacher,
      user: req.session.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error: error.message });
  }
});

// Teacher: Edit assignment page
router.get('/:assignmentId/edit', authenticateUser, authorizeRole(['teacher']), async (req, res) => {
  try {
    const assignment = await req.db.get(
      'SELECT a.*, c.teacher_id FROM assignments a JOIN classes c ON a.class_id = c.id WHERE a.id = ?',
      [req.params.assignmentId]
    );

    if (!assignment || assignment.teacher_id !== req.session.user.id) {
      return res.status(404).render('404');
    }

    res.render('assignments/edit', { assignment });
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error: error.message });
  }
});

// Teacher: Update assignment
router.post('/:assignmentId/edit', authenticateUser, authorizeRole(['teacher']), async (req, res) => {
  try {
    const { title, description, dueDate, maxPoints } = req.body;

    const assignment = await req.db.get(
      'SELECT a.*, c.teacher_id, c.id as class_id FROM assignments a JOIN classes c ON a.class_id = c.id WHERE a.id = ?',
      [req.params.assignmentId]
    );

    if (!assignment || assignment.teacher_id !== req.session.user.id) {
      return res.status(404).render('404');
    }

    if (!title) {
      return res.render('assignments/edit', { assignment, error: 'Title is required' });
    }

    await req.db.run(
      'UPDATE assignments SET title = ?, description = ?, due_date = ?, max_points = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, dueDate || null, maxPoints || 100, req.params.assignmentId]
    );

    res.redirect(`/classes/${assignment.class_id}`);
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error: error.message });
  }
});

module.exports = router;
