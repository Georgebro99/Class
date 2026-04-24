const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRole } = require('../middleware/auth');

// Teacher: Create announcement page
router.get('/create/:classId', authenticateUser, authorizeRole(['teacher']), async (req, res) => {
  try {
    const classData = await req.db.get(
      'SELECT * FROM classes WHERE id = ? AND teacher_id = ?',
      [req.params.classId, req.session.user.id]
    );

    if (!classData) {
      return res.status(404).render('404');
    }

    res.render('announcements/create', { class: classData });
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error: error.message });
  }
});

// Teacher: Create announcement
router.post('/create/:classId', authenticateUser, authorizeRole(['teacher']), async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      const classData = await req.db.get('SELECT * FROM classes WHERE id = ?', [req.params.classId]);
      return res.render('announcements/create', { 
        class: classData, 
        error: 'Title and content are required' 
      });
    }

    await req.db.run(
      'INSERT INTO announcements (class_id, teacher_id, title, content) VALUES (?, ?, ?, ?)',
      [req.params.classId, req.session.user.id, title, content]
    );

    res.redirect(`/classes/${req.params.classId}`);
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error: error.message });
  }
});

// Teacher: Edit announcement page
router.get('/:announcementId/edit', authenticateUser, authorizeRole(['teacher']), async (req, res) => {
  try {
    const announcement = await req.db.get(
      'SELECT * FROM announcements WHERE id = ? AND teacher_id = ?',
      [req.params.announcementId, req.session.user.id]
    );

    if (!announcement) {
      return res.status(404).render('404');
    }

    res.render('announcements/edit', { announcement });
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error: error.message });
  }
});

// Teacher: Update announcement
router.post('/:announcementId/edit', authenticateUser, authorizeRole(['teacher']), async (req, res) => {
  try {
    const { title, content } = req.body;

    const announcement = await req.db.get(
      'SELECT * FROM announcements WHERE id = ? AND teacher_id = ?',
      [req.params.announcementId, req.session.user.id]
    );

    if (!announcement) {
      return res.status(404).render('404');
    }

    if (!title || !content) {
      return res.render('announcements/edit', { 
        announcement, 
        error: 'Title and content are required' 
      });
    }

    await req.db.run(
      'UPDATE announcements SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, content, req.params.announcementId]
    );

    res.redirect(`/classes/${announcement.class_id}`);
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error: error.message });
  }
});

module.exports = router;
