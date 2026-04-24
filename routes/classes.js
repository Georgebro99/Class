const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRole } = require('../middleware/auth');

// Generate class code
const generateClassCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Teacher: Create class page
router.get('/create', authenticateUser, authorizeRole(['teacher']), (req, res) => {
  res.render('classes/create');
});

// Teacher: Create class
router.post('/create', authenticateUser, authorizeRole(['teacher']), async (req, res) => {
  try {
    const { name, description, subject, room } = req.body;

    if (!name) {
      return res.render('classes/create', { error: 'Class name is required' });
    }

    const classCode = generateClassCode();
    const result = await req.db.run(
      'INSERT INTO classes (name, description, code, teacher_id, subject, room) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, classCode, req.session.user.id, subject, room]
    );

    res.redirect(`/classes/${result.id}`);
  } catch (error) {
    console.error(error);
    res.render('classes/create', { error: 'Failed to create class' });
  }
});

// View class
router.get('/:classId', authenticateUser, async (req, res) => {
  try {
    const classData = await req.db.get(
      'SELECT * FROM classes WHERE id = ?',
      [req.params.classId]
    );

    if (!classData) {
      return res.status(404).render('404');
    }

    // Check if user is teacher or enrolled student
    const isTeacher = classData.teacher_id === req.session.user.id;
    const enrollment = await req.db.get(
      'SELECT * FROM enrollments WHERE user_id = ? AND class_id = ?',
      [req.session.user.id, req.params.classId]
    );

    if (!isTeacher && !enrollment && req.session.user.role !== 'teacher') {
      return res.status(403).render('403');
    }

    const teacher = await req.db.get(
      'SELECT * FROM users WHERE id = ?',
      [classData.teacher_id]
    );

    const announcements = await req.db.all(
      'SELECT a.*, u.first_name, u.last_name FROM announcements a JOIN users u ON a.teacher_id = u.id WHERE a.class_id = ? ORDER BY a.created_at DESC',
      [req.params.classId]
    );

    const assignments = await req.db.all(
      'SELECT * FROM assignments WHERE class_id = ? ORDER BY due_date ASC',
      [req.params.classId]
    );

    const students = await req.db.all(
      'SELECT u.* FROM users u JOIN enrollments e ON u.id = e.user_id WHERE e.class_id = ?',
      [req.params.classId]
    );

    res.render('classes/view', {
      class: classData,
      teacher,
      announcements,
      assignments,
      students,
      isTeacher,
      user: req.session.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error: error.message });
  }
});

// Teacher: Edit class page
router.get('/:classId/edit', authenticateUser, authorizeRole(['teacher']), async (req, res) => {
  try {
    const classData = await req.db.get(
      'SELECT * FROM classes WHERE id = ? AND teacher_id = ?',
      [req.params.classId, req.session.user.id]
    );

    if (!classData) {
      return res.status(404).render('404');
    }

    res.render('classes/edit', { class: classData });
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error: error.message });
  }
});

// Teacher: Update class
router.post('/:classId/edit', authenticateUser, authorizeRole(['teacher']), async (req, res) => {
  try {
    const { name, description, subject, room } = req.body;

    if (!name) {
      const classData = await req.db.get('SELECT * FROM classes WHERE id = ?', [req.params.classId]);
      return res.render('classes/edit', { class: classData, error: 'Class name is required' });
    }

    await req.db.run(
      'UPDATE classes SET name = ?, description = ?, subject = ?, room = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND teacher_id = ?',
      [name, description, subject, room, req.params.classId, req.session.user.id]
    );

    res.redirect(`/classes/${req.params.classId}`);
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error: error.message });
  }
});

module.exports = router;
