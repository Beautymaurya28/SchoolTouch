const Attendance = require('../models/Attendance.js');
const Student = require('../models/Student.js');
const Teacher = require('../models/Teacher.js');
const Parent = require('../models/Parent.js');
const Class = require('../models/Class.js');

// In controllers/attendanceController.js

// In controllers/attendanceController.js

const markAttendance = async (req, res) => {
  const { classId, attendanceRecords, date } = req.body;
  const teacherProfileId = req.user.profileId;

  try {
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findById(teacherProfileId);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found.' });
      }

      // FIX: Check assignedClass directly, not an array
      if (teacher.assignedClass && teacher.assignedClass.toString() !== classId) {
        return res.status(403).json({ message: 'Not authorized to mark attendance for this class.' });
      }
    }

    const submissionDate = date ? new Date(date) : new Date();
    const existingRecords = await Attendance.find({
        student: { $in: attendanceRecords.map(r => r.studentId) },
        class: classId,
        date: submissionDate,
    });

    const recordsToInsert = attendanceRecords.filter(rec => 
        !existingRecords.some(ex => ex.student.toString() === rec.studentId)
    ).map(rec => ({
        student: rec.studentId,
        class: classId,
        status: rec.status,
        date: submissionDate,
    }));

    if (recordsToInsert.length > 0) {
        await Attendance.insertMany(recordsToInsert);
    }

    res.status(201).json({ message: 'Attendance marked successfully.' });
  } catch (error) {
    console.error('Server error in markAttendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getClassAttendance = async (req, res) => {
  const { classId, date } = req.params;
  const teacherProfileId = req.user.profileId;

  try {
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findById(teacherProfileId);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found.' });
      }
      // // FIX: Check assignedClass directly
      // if (teacher.assignedClass && teacher.assignedClass.toString() !== classId) {
      //   return res.status(403).json({ message: 'Not authorized to view attendance for this class.' });
      // }

      if (
  teacher.assignedClasses &&
  !teacher.assignedClasses.map(c => c.toString()).includes(classId)
) {
  return res.status(403).json({ message: 'Not authorized to mark attendance for this class.' });
}

    }

    const attendance = await Attendance.find({ class: classId, date: new Date(date) })
      .populate('student', 'name rollNumber')
      .sort({ 'student.rollNumber': 1 });
    res.json(attendance);
  } catch (error) {
    console.error('Server error in getClassAttendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyAttendance = async (req, res) => {
  const { role, profileId } = req.user;
  let studentId;

  try {
    if (role === 'student') {
      studentId = profileId;
    } else if (role === 'parent') {
      const parent = await Parent.findById(profileId);
      if (parent.children.length > 0) {
        studentId = parent.children[0];
      }
    }

    if (!studentId) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const attendance = await Attendance.find({ student: studentId })
      .populate('class', 'className sections')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    console.error('Server error in getMyAttendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  markAttendance,
  getClassAttendance,
  getMyAttendance,
};