const Message = require('../models/Message.js');
const Parent = require('../models/Parent.js');
const Teacher = require('../models/Teacher.js');
const Student = require('../models/Student.js');

const getParentsForTeacher = async (req, res) => {
  const { teacherId } = req.params;
  try {
    const teacher = await Teacher.findById(teacherId).populate({
      path: 'assignedSubjects',
      populate: {
        path: 'class',
        select: 'students',
        populate: {
          path: 'students',
          select: 'name parent',
          populate: {
            path: 'parent',
            select: 'phone name'
          }
        }
      }
    });

    if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });

    const parents = new Set();
    teacher.assignedSubjects.forEach(s => {
      s.class.students.forEach(student => {
        if (student.parent) {
          parents.add(student.parent);
        }
      });
    });
    res.json(Array.from(parents));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTeachersForParent = async (req, res) => {
  const { parentId } = req.params;
  try {
    const parent = await Parent.findById(parentId).populate({
      path: 'children',
      populate: {
        path: 'class',
        populate: {
          path: 'classTeacher assignedSubjects',
          populate: {
            path: 'teacher subject'
          }
        }
      }
    });

    if (!parent) return res.status(404).json({ message: 'Parent not found.' });

    const teachers = new Set();
    parent.children.forEach(child => {
      if (child.class && child.class.classTeacher) teachers.add(child.class.classTeacher);
      if (child.class && child.class.assignedSubjects) {
        child.class.assignedSubjects.forEach(subject => {
          if (subject.teacher) teachers.add(subject.teacher);
        });
      }
    });
    res.json(Array.from(teachers));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMessageHistory = async (req, res) => {
  const { id1, id2 } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: id1, recipient: id2 },
        { sender: id2, recipient: id1 }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getParentsForTeacher, getTeachersForParent, getMessageHistory };