const express = require('express');
const { createHomework, getHomework, submitHomework, getSubmissions, updateHomework, deleteHomework } = require('../Controllers/homeworkController.js');
const { protect, authorize } = require('../middleware/auth.js');
const upload = require('../middleware/upload.js');

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin', 'teacher'), upload.single('attachments'), createHomework) 
  // FIX: Allow Student and Parent to GET (View)
  .get(protect, authorize('admin', 'teacher', 'student', 'parent'), getHomework); 

// ... (other routes remain the same)

module.exports = router;