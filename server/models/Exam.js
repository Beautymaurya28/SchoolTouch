const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  examName: String,
  examType: { type: String, enum: ['Final Exam', 'Term Exam', 'Board Exam', 'Unit Test', 'Half Yearly'] },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  subjects: [
      {
          subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
          maxMarks: Number,
          passingMarks: Number,
          date: Date,           // New unified schedule field
          startTime: String,    // New unified schedule field
          endTime: String,      // New unified schedule field
          room: String,         // New unified schedule field
          invigilator: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' } // New unified schedule field
      }
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  status: { type: String, enum: ['draft', 'scheduled', 'completed'], default: 'draft' }
}, { timestamps: true });

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;