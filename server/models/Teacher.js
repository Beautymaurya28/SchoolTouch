const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: String,
  age: Number,
  dob: Date,
  gender: String,
  qualification: String,
  address: String,
  bio: String,
  isClassTeacher: {
    type: Boolean,
    default: false,
  },
  assignedClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  assignedSubjects: [{
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }
  }],
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;