const express = require('express');
const { getParentsForTeacher, getTeachersForParent, getMessageHistory } = require('../Controllers/chatController.js');
const { protect, authorize } = require('../middleware/auth.js');

const router = express.Router();

router.get('/parents/:teacherId', protect, authorize('teacher'), getParentsForTeacher);
router.get('/teachers/:parentId', protect, authorize('parent'), getTeachersForParent);
router.get('/history/:id1/:id2', protect, authorize('parent', 'teacher'), getMessageHistory);

module.exports = router;