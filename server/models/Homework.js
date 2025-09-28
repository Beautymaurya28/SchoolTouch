const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  section: String,
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  dueDate: { type: Date, required: true },
  attachments: [String], // Teacher's attached files (e.g., PDF of instructions)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    fileUrl: String, // Student's uploaded file path/URL
    marks: Number,
    feedback: String,
    status: { type: String, enum: ['submitted', 'late', 'pending', 'graded'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Homework = mongoose.model('Homework', homeworkSchema);
module.exports = Homework;