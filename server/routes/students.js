// // In routes/subjects.js
// const express = require('express');
// const { addSubject, getSubjects, deleteSubject } = require('../Controllers/subjectController.js');
// const { protect, authorize } = require('../middleware/auth.js');

// const router = express.Router();

// router.route('/')
//   .post(protect, authorize('admin'), addSubject)
//   .get(protect, authorize('admin', 'teacher', 'student', 'parent'), getSubjects); // FIX: Add all roles

// router.route('/:id')
//   .delete(protect, authorize('admin'), deleteSubject);

// module.exports = router;


const express = require('express');
const {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} = require('../Controllers/studentController.js');
const { protect, authorize } = require('../middleware/auth.js');

const router = express.Router();

// Create student (Admin only) & Get students (Admin, Teacher, Parent)
router.route('/')
  .post(protect, authorize('admin'), addStudent)
  .get(protect, authorize('admin', 'teacher', 'parent'), getStudents);

// Get, Update, Delete student by ID
router.route('/:id')
  .get(protect, authorize('admin', 'teacher', 'parent', 'student'), getStudentById)
  .put(protect, authorize('admin'), updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

module.exports = router;
