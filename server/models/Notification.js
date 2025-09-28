const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderRole: {
    type: String,
    enum: ['admin', 'teacher'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }], // Specific user recipients
  targetRole: {
    type: String,
    enum: ['all', 'student', 'teacher', 'parent', 'class'],
    required: true,
  },
  targetClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;