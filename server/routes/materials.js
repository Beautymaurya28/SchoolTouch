const express = require('express');
const { uploadMaterial, getMaterials } = require('../Controllers/studyMaterialController.js');
const { protect, authorize } = require('../middleware/auth.js');
const upload = require('../middleware/upload.js');

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin', 'teacher'), upload.single('attachments'), uploadMaterial) 
  // FIX: Allow Student and Parent to GET (View)
  .get(protect, authorize('admin', 'teacher', 'student', 'parent'), getMaterials); 

// ... (other routes remain the same)

module.exports = router;