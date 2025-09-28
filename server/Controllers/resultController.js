const Result = require('../models/Result.js');
const Exam = require('../models/Exam.js');
const Student = require('../models/Student.js');
const Teacher = require('../models/Teacher.js');
const Parent = require('../models/Parent.js');
const mongoose = require('mongoose');

// Helper to determine Grade/Pass/Fail (simplified)
const calculateStatus = (marks, maxMarks) => {
    const percentage = (marks / maxMarks) * 100;
    const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : 'C';
    const status = percentage >= 33 ? 'Pass' : 'Fail';
    return { grade, status, percentage };
};

// @desc    Teacher/Admin submits or updates results (bulk or single)
// @route   POST /api/results
const submitResults = async (req, res) => {
    const { examId, subjectId, results } = req.body;
    const creatorId = req.user.id;
    const role = req.user.role;

    try {
        const exam = await Exam.findById(examId).select('subjects');
        const subjectMaxMarks = exam.subjects.find(s => s.subjectId.toString() === subjectId)?.maxMarks || 100;

        // Security Check: Teachers can only submit for their assigned subjects
        if (role === 'teacher') {
            const teacher = await Teacher.findById(req.user.profileId);
            if (!teacher || !teacher.assignedSubjects.some(s => s.subject.toString() === subjectId)) {
                return res.status(403).json({ message: 'Teacher is not authorized for this subject.' });
            }
        }
        
        const operations = results.map(r => {
            const { marks, grade, status, percentage } = calculateStatus(r.marks, subjectMaxMarks);
            
            return {
                updateOne: {
                    filter: { student: r.studentId, exam: examId, subject: subjectId },
                    update: { 
                        marks: r.marks, 
                        grade,
                        percentage,
                        status: 'submitted', // Teacher/Admin marks as submitted/draft
                        createdBy: creatorId 
                    },
                    upsert: true 
                }
            };
        });

        await Result.bulkWrite(operations);
        res.json({ message: 'Results submitted successfully.' });

    } catch (error) {
        console.error("Result Submission Crash:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Admin publishes results, making them visible to students/parents
// @route   PATCH /api/results/publish/:examId
const publishResults = async (req, res) => {
    const { examId } = req.params;
    try {
        await Result.updateMany({ exam: examId, status: 'submitted' }, { status: 'published' });
        res.json({ message: 'Results published successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Teacher/Admin views results for their classes/subjects
// @route   GET /api/results/class/:classId
const getClassResults = async (req, res) => {
    // Teacher access check is handled by middleware
    const { classId } = req.params;
    const { examId, subjectId } = req.query;
    let query = { class: classId };
    if (examId) query.exam = examId;
    if (subjectId) query.subject = subjectId;

    try {
        const results = await Result.find(query)
            .populate('student', 'name rollNumber')
            .populate('exam', 'examName')
            .populate('subject', 'subjectName');
        
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Student/Parent views their own published results
// @route   GET /api/results/my-results
const getStudentResults = async (req, res) => {
    const { profileId, role } = req.user;
    let studentId = null;

    if (role === 'student') {
        studentId = profileId;
    } else if (role === 'parent') {
        const parent = await Parent.findById(profileId);
        if (parent.children.length > 0) studentId = parent.children[0];
    }
    
    if (!studentId) return res.status(404).json({ message: 'Student profile not linked.' });

    try {
        const results = await Result.find({ student: studentId, status: 'published' })
            .populate('exam', 'examName')
            .populate('subject', 'subjectName');

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { submitResults, publishResults, getClassResults, getStudentResults };