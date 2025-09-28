const express = require('express');
const {
  addBook,
  issueBook,
  returnBook,
  getStudentIssuedBooks,
  getBooks,
  getIssuedBooks
} = require('../Controllers/libraryController.js');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin-only routes
router.post('/books', protect, authorize('admin'), addBook);
router.put('/return/:issueId', protect, authorize('admin', 'teacher'), returnBook);

// Admin/Teacher routes
router.post('/issue', protect, authorize('admin', 'teacher'), issueBook);
router.get('/books', protect, authorize('admin', 'teacher'), getBooks);
router.get('/issued', protect, authorize('admin', 'teacher'), getIssuedBooks);

// Student route
router.get('/student/:studentId', protect, authorize('student', 'admin', 'parent'), getStudentIssuedBooks);

module.exports = router;