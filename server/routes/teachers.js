const express = require('express');
const { addTeacher, getTeachers, getTeacherById, updateTeacher, deleteTeacher } = require('../Controllers/teacherController.js');
const { protect, authorize } = require('../middleware/auth.js');

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin'), addTeacher)
  .get(protect, authorize('admin', 'teacher'), getTeachers); // FIX: Allow 'teacher' role to view list

router.route('/:id')
  .get(protect, authorize('admin', 'teacher'), getTeacherById)
  .put(protect, authorize('admin'), updateTeacher)
  .delete(protect, authorize('admin'), deleteTeacher);

module.exports = router;