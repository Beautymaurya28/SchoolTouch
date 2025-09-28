const express = require('express');
const { sendNotification, getMyNotifications } = require('../Controllers/notificationController.js');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin/Teacher route to send announcements
router.post('/', protect, authorize('admin', 'teacher'), sendNotification);

// All roles can get their own notifications
router.get('/me', protect, getMyNotifications);

module.exports = router;