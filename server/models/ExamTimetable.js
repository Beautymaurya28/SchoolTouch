const mongoose = require('mongoose');

const examTimetableSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
    unique: true,
  },
  schedule: [{
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    date: Date,
    startTime: String,
    endTime: String,
    room: String,
    invigilator: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
  }]
});

const ExamTimetable = mongoose.model('ExamTimetable', examTimetableSchema);
module.exports = ExamTimetable;