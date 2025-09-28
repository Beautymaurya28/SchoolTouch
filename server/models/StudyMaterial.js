const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  section: String,
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  fileUrl: { type: String, required: true }, // The main material file path/URL
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
}, { timestamps: true });

const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);
module.exports = StudyMaterial;