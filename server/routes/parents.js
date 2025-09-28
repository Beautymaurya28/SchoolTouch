const express = require('express');
const { addParent, getParents, updateParent, deleteParent, getParentById } = require('../Controllers/parentController.js');
const { protect, authorize } = require('../middleware/auth.js');

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin'), addParent)
  .get(protect, authorize('admin'), getParents);

router.route('/:id')
  .get(protect, authorize('parent', 'admin'), getParentById) // Allow parent/admin access
  .put(protect, authorize('admin'), updateParent)
  .delete(protect, authorize('admin'), deleteParent);

module.exports = router;
