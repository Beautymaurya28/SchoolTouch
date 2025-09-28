const express = require('express');
const { createSchedule, getSchedules, deleteSchedule } = require('../Controllers/scheduleController.js');
const { protect, authorize } = require('../middleware/auth.js');

const router = express.Router();

// Admin routes for creating/deleting schedules
router.route('/')
  .post(protect, authorize('admin', 'teacher'), createSchedule);

router.route('/class/:classId')
  .get(protect, authorize('admin', 'teacher', 'student', 'parent'), getSchedules);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteSchedule);

module.exports = router;