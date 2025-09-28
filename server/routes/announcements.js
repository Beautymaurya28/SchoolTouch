// const express = require('express');
// const router = express.Router();
// const {
//     createAnnouncement,
//     getAnnouncements,
//     getAnnouncementsForAdmin,
//     getTeacherClasses,
//     updateAnnouncement,
//     deleteAnnouncement
// } = require('../Controllers/announcementController.js');

// const { protect, authorize } = require('../middleware/auth.js');

// // Admin creates announcement
// router.post('/', protect, authorize('admin', 'teacher'), createAnnouncement);

// // Get announcements (role-based)
// router.get('/', protect, getAnnouncements);

// // Get teacher classes for dropdown
// router.get('/teacher/classes', protect, authorize('teacher'), getTeacherClasses);

// // Admin fetch all announcements
// router.get('/admin', protect, authorize('admin'), getAnnouncementsForAdmin);

// // Update announcement
// router.put('/:id', protect, updateAnnouncement);

// // Delete announcement
// router.delete('/:id', protect, deleteAnnouncement);

// module.exports = router;

// routes/announcementRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.js');
const Announcement = require('../models/Announcement.js');
const Teacher = require('../models/Teacher.js');
const Class = require('../models/Class.js');

// Get teacher's assigned classes
router.get('/teacher/classes', protect, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.profileId)
      .populate('assignedClass')
      .populate('assignedSubjects.class');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });

    const classIds = [];
    if (teacher.assignedClass) classIds.push(teacher.assignedClass._id);
    teacher.assignedSubjects.forEach(s => {
      if (s.class) classIds.push(s.class._id);
    });

    const classes = await Class.find({ _id: { $in: classIds } });
    res.json({ classes });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Existing announcement routes...
// router.get('/', getAnnouncements);
// router.post('/', createAnnouncement);
// router.put('/:id', updateAnnouncement);
// router.delete('/:id', deleteAnnouncement);
// router.get('/admin', getAnnouncementsForAdmin);

module.exports = router;
