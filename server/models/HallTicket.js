const mongoose = require('mongoose');

const hallTicketSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', unique: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', unique: true },
  rollNumber: String,
  examRoom: String,
  seatNumber: String,
  issueDate: { type: Date, default: Date.now },
});

const HallTicket = mongoose.model('HallTicket', hallTicketSchema);
module.exports = HallTicket;