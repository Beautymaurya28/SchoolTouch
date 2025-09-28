const express = require('express');
const { addClass, getClasses, getClassById, updateClass, deleteClass } = require('../Controllers/classController.js');
const { protect, authorize } = require('../middleware/auth.js');



const router = express.Router();

router.route('/')
  .post(protect, authorize('admin'), addClass)
  .get(protect, authorize('admin', 'teacher', 'student', 'parent'), getClasses); // FIX: Allow all viewing roles

router.route('/:id')
  .get(protect, authorize('admin', 'teacher', 'student', 'parent'), getClassById)
  .put(protect, authorize('admin'), updateClass)
  .delete(protect, authorize('admin'), deleteClass);

module.exports = router;