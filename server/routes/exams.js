const express = require('express');
const {
  createExam,
  getExams,
  updateExam,
  deleteExam,
  submitResults,
  publishResults,
  getExamTimetableForUser,
  getStudentResults,
  getExamById
} = require('../Controllers/examController.js');

const { protect, authorize } = require('../middleware/auth.js');

const router = express.Router();

// ==========================
// 📌 EXAM MANAGEMENT (Admin)
// ==========================
router.route('/')
  .post(protect, authorize('admin'), createExam)   // Create exam
  .get(protect, authorize('admin', 'teacher'), getExams); // Admin + Teacher can see list

router.route('/:id')
  .get(protect, authorize('admin', 'teacher'), getExamById) // Fetch one exam
  .put(protect, authorize('admin'), updateExam)   // Update exam
  .delete(protect, authorize('admin'), deleteExam); // Delete exam

// ==========================
// 📌 RESULTS (Teacher + Admin)
// ==========================
router.post('/results', protect, authorize('teacher'), submitResults);  
router.patch('/results/publish/:examId', protect, authorize('admin'), publishResults);

// ==========================
// 📌 TIMETABLE (All roles, but secure per logic in controller)
// ==========================
router.get('/timetable/user/:profileId', protect, getExamTimetableForUser);

// ==========================
// 📌 STUDENT RESULTS (Student/Parent/Admin)
// ==========================
router.get('/results/student/:studentId', protect, getStudentResults);

module.exports = router;
