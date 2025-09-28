const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'teacher'], required: true },
  targetClass: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  targetRole: { type: String, enum: ['all', 'student', 'teacher', 'parent', 'class'], required: true },
  attachment: { type: String, default: null },
  date: { type: Date },
  time: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
