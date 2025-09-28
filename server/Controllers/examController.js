const Exam = require('../models/Exam.js');
const Result = require('../models/Result.js');
const HallTicket = require('../models/HallTicket.js');
const Teacher = require('../models/Teacher.js');
const Class = require('../models/Class.js');
const Subject = require('../models/Subject.js');
const Student = require('../models/Student.js');
const User = require('../models/User.js');
const Parent = require('../models/Parent.js');
// const ExamTimetable = require('../models/ExamTimetable.js'); // Not used in this unified model

// @desc    Admin creates a new exam with the full timetable schedule embedded in subjects
// @route   POST /api/exams
const createExam = async (req, res) => {
  const { examName, examType, classId, subjects, resultFormat } = req.body;
  try {
    // Note: The frontend must send the subjects array with full schedule details (date, time, room, invigilator)
    const newExam = new Exam({ examName, examType, class: classId, subjects, createdBy: req.user.id, resultFormat });
    await newExam.save();
    res.status(201).json({ message: 'Exam created and scheduled successfully', exam: newExam });
  } catch (error) {
    console.error("Exam Creation Crash:", error.message);
    res.status(500).json({ message: 'Server error: Failed to create exam.', error: error.message });
  }
};

// @desc    Admin/Teacher gets all exams (used by ExamManagement.js table)
// @route   GET /api/exams
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find({})
      .populate('class', 'className section')
      .populate('subjects.subjectId', 'subjectName')
      .populate('subjects.invigilator', 'name');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin updates an exam
// @route   PUT /api/exams/:id
const updateExam = async (req, res) => {
    const { examName, examType, classId, subjects, resultFormat } = req.body;
    try {
        const exam = await Exam.findByIdAndUpdate(req.params.id, { examName, examType, class: classId, subjects, resultFormat }, { new: true });
        res.json({ message: 'Exam updated successfully', exam });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Admin deletes an exam
// @route   DELETE /api/exams/:id
const deleteExam = async (req, res) => {
    try {
        await Exam.findByIdAndDelete(req.params.id);
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Admin generates hall tickets for an exam
// @route   POST /api/exams/:examId/halltickets

// @desc    Teacher submits results for a subject
// @route   POST /api/results
const submitResults = async (req, res) => {
  const { examId, subjectId, results } = req.body;
  const teacherId = req.user.profileId;
  try {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher || !teacher.assignedSubjects.some(s => s.subject.toString() === subjectId)) {
      return res.status(403).json({ message: 'Not authorized to submit results for this subject.' });
    }
    
    const resultEntries = results.map(r => ({
      student: r.studentId,
      exam: examId,
      subject: subjectId,
      marks: r.marks,
      grade: r.grade,
      remark: r.remark,
      status: 'submitted',
      createdBy: teacherId,
    }));
    await Result.insertMany(resultEntries);
    res.status(201).json({ message: 'Results submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin publishes results
// @route   PATCH /api/results/publish/:examId
const publishResults = async (req, res) => {
    const { examId } = req.params;
    try {
        await Result.updateMany({ exam: examId }, { status: 'published' });
        res.json({ message: 'Results published successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get exam timetable based on user role and ID (Unified API)
// @route   GET /api/exams/timetable/user/:profileId
const getExamTimetableForUser = async (req, res) => {
    const { profileId } = req.params;
    const { role } = req.user; 
    let studentId = profileId; // Default to current profileId (student/parent)
    let classId = null;

    try {
        // 1. Determine Class ID based on Role
        if (role === 'student' || role === 'parent') {
            const student = await Student.findById(studentId).populate('class');
            if (!student || !student.class) return res.status(404).json({ message: 'Student class not found.' });
            classId = student.class._id;
        } else if (role === 'teacher') {
            const teacher = await Teacher.findById(profileId);
            if (!teacher || !teacher.assignedClass) {
                return res.json([]); // Return empty array if no primary class is assigned
            }
            classId = teacher.assignedClass;
        } else {
            return res.status(403).json({ message: 'Not authorized to access this route.' });
        }
        
        if (!classId) {
            return res.status(404).json({ message: 'No relevant class found for this user.' });
        }

        // 2. Define Invigilator Population based on Role (SECURITY RULE)
        const invigilatorPopulateFields = (role === 'teacher' || role === 'admin') 
            ? 'name' // Teacher sees the invigilator's name
            : null; // Student/Parent do NOT see the invigilator's name

        // 3. Fetch Exams for the determined Class ID
        const exams = await Exam.find({ class: classId })
            .populate('class', 'className section')
            .populate('subjects.subjectId', 'subjectName')
            .populate('subjects.invigilator', invigilatorPopulateFields);

        res.json(exams);

    } catch (error) {
        console.error("Error in getExamTimetableForUser:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get results for a single student across all exams
// @route   GET /api/exams/results/student/:studentId
const getStudentResults = async (req, res) => {
    const loggedInUserId = req.user.id;
    try {
      const student = await Student.findById(req.params.studentId).populate('user');
      if (!student) return res.status(404).json({ message: 'Student not found.' });

      if (req.user.role === 'student' && loggedInUserId.toString() !== student.user.toString()) {
        return res.status(403).json({ message: 'Not authorized to view other students\' results.' });
      }
      if (req.user.role === 'parent') {
        const parent = await Parent.findOne({ user: loggedInUserId });
        const childrenIds = parent.children.map(child => child.toString());
        if (!childrenIds.includes(req.params.studentId)) {
          return res.status(403).json({ message: 'Not authorized to view results for this student.' });
        }
      }
      
      const results = await Result.find({ student: req.params.studentId, status: 'published' })
        .populate('exam', 'examName date')
        .populate('subject', 'subjectName');
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
};

const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
          .populate('class', 'className section')
          .populate('subjects.subjectId', 'subjectName')
          .populate('subjects.invigilator', 'name');
        if (!exam) return res.status(404).json({ message: 'Exam not found.' });
        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Final export statement
module.exports = { createExam, getExams, updateExam, deleteExam, submitResults,  publishResults, getExamTimetableForUser , getStudentResults,getExamById };