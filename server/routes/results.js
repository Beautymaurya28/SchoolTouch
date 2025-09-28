const express = require('express');
const { submitResults, publishResults, getClassResults, getStudentResults } = require('../Controllers/resultController.js');
const { protect, authorize } = require('../middleware/auth.js');

const router = express.Router();

// TEACHER/ADMIN: Submit and Publish
router.post('/', protect, authorize('admin', 'teacher'), submitResults);
router.patch('/publish/:examId', protect, authorize('admin'), publishResults);

// TEACHER/ADMIN: View results for a class (Used for teacher review)
router.get('/class/:classId', protect, authorize('admin', 'teacher'), getClassResults);

// STUDENT/PARENT: View own results
router.get('/my-results', protect, authorize('student', 'parent'), getStudentResults);

module.exports = router;