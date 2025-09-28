const Subject = require('../models/Subject.js');
const Class = require('../models/Class.js');

const addSubject = async (req, res) => {
  const { subjectName, classId } = req.body;
  try {
    const subjectExists = await Subject.findOne({ subjectName, class: classId });
    if (subjectExists) {
      return res.status(400).json({ message: 'Subject already exists for this class.' });
    }
    const newSubject = new Subject({ subjectName, class: classId });
    await newSubject.save();
    res.status(201).json({ message: 'Subject added successfully', subject: newSubject });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSubjects = async (req, res) => {
  const { classId } = req.query;
  try {
    const query = classId ? { class: classId } : {};
    const subjects = await Subject.find(query).populate('class', 'className section');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
    if (!deletedSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addSubject, getSubjects, deleteSubject };