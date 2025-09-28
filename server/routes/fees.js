const express = require('express');
const {
  createFeeStructure,
  getFeeStructures, // new
  recordPayment,
  getChildFeeDetails,
  getFeesSummary,
  getPaymentRecords
} = require('../Controllers/feeController.js');
const { getParentById } = require("../Controllers/parentController.js")
const { protect, authorize } = require('../middleware/auth.js');

const router = express.Router();

// Admin routes
router.post('/structure', protect, authorize('admin'), createFeeStructure);
router.get('/structure', protect, authorize('admin'), getFeeStructures); // new GET route
router.get('/summary', protect, authorize('admin'), getFeesSummary);
router.get('/payment', protect, authorize('admin'), getPaymentRecords);
router.post('/payment', protect, authorize('admin'), recordPayment);

router.get("/:id", protect, authorize("parent"), getParentById);

// Parent/Student routes
router.get('/child/:studentId', protect, authorize('student', 'parent'), getChildFeeDetails);

module.exports = router;
