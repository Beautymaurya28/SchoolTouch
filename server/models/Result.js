const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  marks: Number,
  grade: String,
  remark: String,
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'published'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
}, { timestamps: true });

resultSchema.index({ student: 1, exam: 1, subject: 1 }, { unique: true });

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;