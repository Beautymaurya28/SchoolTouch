const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  studentCode: {
    type: String,
    unique: true,
    required: true,
  },
  rollNumber: {
    type: String,
    unique: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  section: String,
  phone: String,
  address: String,
  gender: String,
  age: Number,
  dob: Date,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent',
  },
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;