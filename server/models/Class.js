const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    trim: true,
  },
  subjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
  }],
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
});

classSchema.index({ className: 1, section: 1 }, { unique: true, partialFilterExpression: { section: { $exists: true } } });

const Class = mongoose.model('Class', classSchema);
module.exports = Class;