const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
    unique: true,
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      required: true
    },
    periods: [{
      periodNumber: Number,
      startTime: String,
      endTime: String,
      subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
      teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
    }]
  }]
});

module.exports = mongoose.model('Timetable', timetableSchema);
