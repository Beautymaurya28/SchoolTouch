const express = require('express');
const { addSubject, getSubjects, deleteSubject } = require('../controllers/subjectController.js');
const { protect, authorize } = require('../middleware/auth.js');

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin'), addSubject)
  // FIX: Allow all roles to GET subjects, as they need them for dropdowns/viewing.
  .get(protect, authorize('admin', 'teacher', 'student', 'parent'), getSubjects); 

router.route('/:id')
  .delete(protect, authorize('admin'), deleteSubject);

module.exports = router;