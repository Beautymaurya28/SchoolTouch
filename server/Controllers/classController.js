// const Class = require('../models/Class.js');
// const Teacher = require('../models/Teacher.js');
// const Student = require('../models/Student.js');
// const mongoose = require('mongoose');

// const addClass = async (req, res) => {
//   const { className, section, subjects, classTeacherId, studentIds } = req.body;
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const classExists = await Class.findOne({ className, section }).session(session);
//     if (classExists) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ message: 'Class with this section already exists' });
//     }

//     const newClass = new Class({ className, section, subjects, classTeacher: classTeacherId, students: studentIds });
//     await newClass.save({ session });

//     if (classTeacherId) {
//       await Teacher.findByIdAndUpdate(classTeacherId, { assignedClass: newClass._id }, { session });
//     }
    
//     // FIX: Update students to link them to the new class
//     if (studentIds && studentIds.length > 0) {
//       await Student.updateMany({ _id: { $in: studentIds } }, { class: newClass._id }, { session });
//     }

//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json({ message: 'Class added successfully', class: newClass });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// const getClasses = async (req, res) => {
//   try {
//     const classes = await Class.find({})
//       .populate('classTeacher', 'name')
//       .populate('subjects', 'subjectName')
//       .populate('students', 'name rollNumber')
//       .select('-__v');
//     res.json(classes);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const getClassById = async (req, res) => {
//   try {
//     const classItem = await Class.findById(req.params.id)
//       .populate('classTeacher', 'name')
//       .populate('subjects', 'subjectName')
//       .populate('students', 'name rollNumber');
//     if (!classItem) {
//       return res.status(404).json({ message: 'Class not found' });
//     }
//     res.json(classItem);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// const updateClass = async (req, res) => {
//   const { className, section, subjects, classTeacherId, studentIds } = req.body;
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const updatedClass = await Class.findById(req.params.id).session(session);
//     if (!updatedClass) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ message: 'Class not found' });
//     }

//     if (updatedClass.classTeacher && updatedClass.classTeacher.toString() !== classTeacherId) {
//       await Teacher.findByIdAndUpdate(updatedClass.classTeacher, { assignedClass: null }, { session });
//     }
//     if (classTeacherId) {
//       await Teacher.findByIdAndUpdate(classTeacherId, { assignedClass: updatedClass._id }, { session });
//     }
    
//     // FIX: Unlink old students from the class
//     await Student.updateMany({ class: updatedClass._id }, { class: null }, { session });
//     // FIX: Link new students to the class
//     if (studentIds && studentIds.length > 0) {
//       await Student.updateMany({ _id: { $in: studentIds } }, { class: updatedClass._id }, { session });
//     }

//     updatedClass.className = className || updatedClass.className;
//     updatedClass.section = section;
//     updatedClass.subjects = subjects || updatedClass.subjects;
//     updatedClass.classTeacher = classTeacherId || null;
//     updatedClass.students = studentIds || updatedClass.students;
//     await updatedClass.save({ session });
    
//     await session.commitTransaction();
//     session.endSession();
//     res.json({ message: 'Class updated successfully', class: updatedClass });
//   } catch (error) {
//       await session.abortTransaction();
//       session.endSession();
//       res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// const deleteClass = async (req, res) => {
//   try {
//     const deletedClass = await Class.findByIdAndDelete(req.params.id);
//     if (!deletedClass) {
//       return res.status(404).json({ message: 'Class not found' });
//     }
//     res.json({ message: 'Class deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// module.exports = { addClass, getClasses, getClassById, updateClass, deleteClass };



const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const mongoose = require('mongoose');

const addClass = async (req, res) => {
  const { className, section, subjects, classTeacherId, studentIds } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const classExists = await Class.findOne({ className, section }).session(session);
    if (classExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Class with this section already exists' });
    }

    const newClass = new Class({
      className,
      section,
      subjects,
      classTeacher: classTeacherId,
      students: studentIds || []
    });
    await newClass.save({ session });

    if (classTeacherId) {
      await Teacher.findByIdAndUpdate(classTeacherId, { assignedClass: newClass._id }, { session });
    }

    // ✅ Link students
    if (studentIds && studentIds.length > 0) {
      await Student.updateMany({ _id: { $in: studentIds } }, { class: newClass._id }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Class added successfully', class: newClass });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const getClasses = async (req, res) => {
  try {
    const classes = await Class.find({})
      .populate('classTeacher', 'name')
      .populate('subjects', 'subjectName')
      .populate('students', 'name rollNumber')
      .select('-__v');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const getClassById = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('classTeacher', 'name')
      .populate('subjects', 'subjectName')
      .populate({ // FIX: Nested population to get Parent's phone inside each student
          path: 'students',
          select: 'name rollNumber parent',
          populate: {
              path: 'parent',
              select: 'name phone' // Fetches name and phone of the Parent
          }
      }); 
    
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // The class data is now correct.
    res.json(classItem);
  } catch (error) {
    console.error("Error in getClassById:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const updateClass = async (req, res) => {
  const { className, section, subjects, classTeacherId, studentIds } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedClass = await Class.findById(req.params.id).session(session);
    if (!updatedClass) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Class not found' });
    }

    // Update class teacher
    if (updatedClass.classTeacher && updatedClass.classTeacher.toString() !== classTeacherId) {
      await Teacher.findByIdAndUpdate(updatedClass.classTeacher, { assignedClass: null }, { session });
    }
    if (classTeacherId) {
      await Teacher.findByIdAndUpdate(classTeacherId, { assignedClass: updatedClass._id }, { session });
    }

    // Update students
    await Student.updateMany({ class: updatedClass._id }, { class: null }, { session });
    if (studentIds && studentIds.length > 0) {
      await Student.updateMany({ _id: { $in: studentIds } }, { class: updatedClass._id }, { session });
    }

    updatedClass.className = className || updatedClass.className;
    updatedClass.section = section;
    updatedClass.subjects = subjects || updatedClass.subjects;
    updatedClass.classTeacher = classTeacherId || null;
    updatedClass.students = studentIds || [];

    await updatedClass.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Class updated successfully', class: updatedClass });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const deleteClass = async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // unlink students
    await Student.updateMany({ class: deletedClass._id }, { class: null });

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCombinedClassData = async (req, res) => {
  const { role, profileId } = req.user;
  console.log("➡️ Role:", role, "ProfileId:", profileId);

  let classId = null;

  try {
    if (role === 'teacher') {
      const teacher = await Teacher.findById(profileId).populate('assignedClass');
      if (teacher && teacher.assignedClass) {
        classId = teacher.assignedClass._id;
      }
    } 
    else if (role === 'student') {
      const student = await Student.findById(profileId);
      if (student) {
        classId = student.class;
      }
    } 
    else if (role === 'parent') {
      const student = await Student.findOne({ parent: profileId });
      console.log("Parent found student:", student);
      if (student) {
        classId = student.class;
      }
    } 
    else if (role === 'admin') {
      classId = req.query.classId;
      if (!classId) {
        return res.status(400).json({ message: "Admin must provide classId in query (e.g. /my-class?classId=123)" });
      }
    } 
    else {
      return res.status(403).json({ message: 'Not authorized to access this.' });
    }

    if (!classId) {
      return res.status(404).json({ message: 'Class not found for this user.' });
    }

    const classData = await Class.findById(classId)
      .populate('classTeacher', 'name')
      .populate('subjects', 'subjectName')
      .populate({
        path: 'students',
        populate: {
          path: 'parent',
          select: 'name phone'
        },
        select: 'name rollNumber studentCode parent'
      });

    if (!classData) {
      return res.status(404).json({ message: 'Class data not found.' });
    }

    let responseData = {
      className: classData.className,
      section: classData.section,
      classTeacher: classData.classTeacher,
      subjects: classData.subjects,
    };

    if (role === 'teacher') {
      responseData.students = classData.students.map(student => ({
        name: student.name,
        rollNumber: student.rollNumber,
        studentCode: student.studentCode,
        parentPhone: student.parent?.phone,
      }));
    } 
    else if (role === 'student') {
      responseData.myDetails = classData.students.find(s => s._id.toString() === profileId.toString());
    } 
    else if (role === 'parent') {
      responseData.students = classData.students
        .filter(student => student.parent?._id.toString() === profileId.toString())
        .map(student => ({
          name: student.name,
          rollNumber: student.rollNumber,
          studentCode: student.studentCode,
        }));
    } 
    else if (role === 'admin') {
      responseData.students = classData.students.map(student => ({
        name: student.name,
        rollNumber: student.rollNumber,
        studentCode: student.studentCode,
        parentName: student.parent?.name,
        parentPhone: student.parent?.phone,
      }));
    }

    res.json(responseData);
  } catch (error) {
    console.error('❌ Error in getCombinedClassData:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = { addClass, getClasses, getClassById, updateClass, deleteClass,getCombinedClassData };
