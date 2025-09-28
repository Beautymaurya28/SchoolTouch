const Homework = require('../models/Homework.js');
const Student = require('../models/Student.js');
const Teacher = require('../models/Teacher.js');

// @desc    Teacher creates a new homework assignment
// @route   POST /api/homework
const createHomework = async (req, res) => {
  const { title, description, classId, section, subjectId, dueDate, attachments } = req.body;
  // NOTE: The backend needs the base User ID for tracking creator, but profileId is also available.
  const createdBy = req.user.id; 
  try {
    const newHomework = new Homework({
      title, description, class: classId, section, subject: subjectId, dueDate, attachments, createdBy
    });
    await newHomework.save();
    res.status(201).json({ message: 'Homework created successfully', homework: newHomework });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get homework list filtered by role
// @route   GET /api/homework
// In controllers/homeworkController.js

const getHomework = async (req, res) => {
  const { role, profileId } = req.user;
  let query = {};
  try {
    // 1. Filter for students and parents (by student's class)
    if (role === 'student' || role === 'parent') {
      // FIX: Fetch the student's profile to get the correct class ID
      const student = await Student.findById(profileId); 
      
      // If student is found, filter homework by their class
      if (student && student.class) {
        query = { class: student.class }; 
      } else {
        // If profileId is for a Parent, the Parent model stores the Student IDs in children[]
        const parent = await Parent.findById(profileId).populate('children', 'class');
        if (parent && parent.children.length > 0) {
            query = { class: parent.children[0].class }; 
        } else {
            return res.json([]); // No class found, return empty array
        }
      }
    } 
    // 2. Filter for teachers (sees all for management/submission overview)
    else if (role === 'teacher') {
        // Teacher sees all homework/material for management simplicity
    }
    // Admin sees all (empty query)
    
    const homeworks = await Homework.find(query)
      .populate('class', 'className section')
      .populate('subject', 'subjectName')
      .populate('createdBy', 'name');
      
    res.json(homeworks);
  } catch (error) {
    console.error("Error fetching homework:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Ensure this is exported at the bottom:
// module.exports = { createHomework, getHomework, submitHomework, getSubmissions, updateHomework, deleteHomework };

// @desc    Teacher/Admin updates an existing homework
// @route   PUT /api/homework/:id
const updateHomework = async (req, res) => {
    const { title, description, classId, section, subjectId, dueDate } = req.body;
    const { id } = req.params;
    
    try {
        const homework = await Homework.findById(id);
        if (!homework) return res.status(404).json({ message: 'Homework not found.' });

        // SECURITY: Only the creator (user ID stored in createdBy) or Admin can edit
        if (homework.createdBy.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to edit this homework.' });
        }

        // Apply updates
        const updatedHomework = await Homework.findByIdAndUpdate(
            id,
            { title, description, class: classId, section, subject: subjectId, dueDate },
            { new: true }
        );
        res.json({ message: 'Homework updated successfully', homework: updatedHomework });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Teacher/Admin deletes a homework
// @route   DELETE /api/homework/:id
const deleteHomework = async (req, res) => {
    const { id } = req.params;
    try {
        const homework = await Homework.findById(id);
        if (!homework) return res.status(404).json({ message: 'Homework not found.' });

        // SECURITY: Only the creator (user ID stored in createdBy) or Admin can delete
        if (homework.createdBy.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this homework.' });
        }

        await Homework.findByIdAndDelete(id);
        res.json({ message: 'Homework deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Student submits homework
// @route   POST /api/homework/:id/submit
const submitHomework = async (req, res) => {
  const { fileUrl } = req.body;
  const studentId = req.user.profileId;
  try {
    const homework = await Homework.findById(req.params.id);
    if (!homework) return res.status(404).json({ message: 'Homework not found.' });

    // Logic to add/update submission
    const submission = { student: studentId, fileUrl };
    const existingIndex = homework.submissions.findIndex(sub => sub.student.toString() === studentId.toString());

    if (existingIndex > -1) {
        homework.submissions.splice(existingIndex, 1, submission); // Overwrite submission
    } else {
        homework.submissions.push(submission);
    }

    await homework.save();
    res.status(201).json({ message: 'Homework submitted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Teacher/Admin gets homework submissions
// @route   GET /api/homework/:id/submissions
const getSubmissions = async (req, res) => {
    try {
        const homework = await Homework.findById(req.params.id)
            .populate('submissions.student', 'name rollNumber');
            
        if (!homework) return res.status(404).json({ message: 'Homework not found.' });
        
        // Security check: ensure the user is an admin or the creator of the homework
        if (homework.createdBy.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view submissions for this homework.' });
        }

        res.json(homework.submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createHomework, getHomework, submitHomework, getSubmissions, updateHomework, deleteHomework };