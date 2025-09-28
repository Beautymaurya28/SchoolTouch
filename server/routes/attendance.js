const express = require('express');
const { markAttendance, getClassAttendance, getMyAttendance } = require('../Controllers/attendanceController.js');
const { protect, authorize } = require('../middleware/auth.js');

const router = express.Router();

router.route('/mark')
  .post(protect, authorize('admin', 'teacher'), markAttendance);

router.route('/class/:classId/:date')
  .get(protect, authorize('admin', 'teacher'), getClassAttendance);

router.route('/me')
  .get(protect, authorize('student', 'parent'), getMyAttendance);

module.exports = router;