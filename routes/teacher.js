const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRole } = require('../middleware/auth');

// Teacher: Dashboard
router.get('/dashboard', authenticateUser, authorizeRole(['teacher']), async (req, res) => {
  try {
    const classes = await req.db.all(
      'SELECT * FROM classes WHERE teacher_id = ? ORDER BY created_at DESC',
      [req.session.user.id]
    );

    const classesWithStats = await Promise.all(
      classes.map(async (classItem) => {
        const studentCount = await req.db.get(
          'SELECT COUNT(*) as count FROM enrollments WHERE class_id = ?',
          [classItem.id]
        );
        const assignmentCount = await req.db.get(
          'SELECT COUNT(*) as count FROM assignments WHERE class_id = ?',
          [classItem.id]
        );
        return {
          ...classItem,
          studentCount: studentCount.count,
          assignmentCount: assignmentCount.count
        };
      })
    );

    res.render('teacher/dashboard', {
      user: req.session.user,
      classes: classesWithStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error: error.message });
  }
});

module.exports = router;
