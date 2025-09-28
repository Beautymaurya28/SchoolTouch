const Teacher = require('../models/Teacher.js');
const User = require('../models/User.js');
const Class = require('../models/Class.js');
const mongoose = require('mongoose');

const addTeacher = async (req, res) => {
  const { name, email, password, phone, age, dob, gender, qualification, isClassTeacher, assignedClass, assignedSubjects, address, bio } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userExists = await User.findOne({ email }).session(session);
    if (userExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const user = await User.create([{ email, password, role: 'teacher', name }], { session });
    
    const teacherData = {
      user: user[0]._id, name, phone, age, dob, gender, qualification, isClassTeacher, address, bio,
    };
    if (isClassTeacher && assignedClass) {
        teacherData.assignedClass = assignedClass;
    }
    if (assignedSubjects && assignedSubjects.length > 0) {
        teacherData.assignedSubjects = assignedSubjects;
    }
    
    const teacher = await Teacher.create([teacherData], { session });

    if (teacherData.assignedClass) {
        await Class.findByIdAndUpdate(teacherData.assignedClass, { classTeacher: teacher[0]._id }, { session });
    }
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ message: 'Teacher added successfully', teacher: teacher[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTeachers = async (req, res) => {
  const { search, classId, subjectId } = req.query;
  try {
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (classId) {
      query.$or = [{ assignedClass: classId }, { 'assignedSubjects.class': classId }];
    }
    if (subjectId) {
      query['assignedSubjects.subject'] = subjectId;
    }
    
    const teachers = await Teacher.find(query)
      .populate('user', 'email name')
      .populate('assignedClass', 'className section')
      .populate({
          path: 'assignedSubjects.class',
          select: 'className section'
      })
      .populate({
          path: 'assignedSubjects.subject',
          select: 'subjectName'
      })
      .select('-__v');
      
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user', 'email name')
      .populate('assignedClass', 'className section')
      .populate({
          path: 'assignedSubjects',
          populate: [
              { path: 'class', select: 'className section' },
              { path: 'subject', select: 'subjectName' }
          ]
      })
      .select('-__v');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const getMyClasses = async (req, res) => {
  try {
    // req.user.id comes from the protect middleware (logged-in user)
    const teacher = await Teacher.findOne({ user: req.user.id })
      .populate('assignedClass', 'className section')
      .populate({
        path: 'assignedSubjects.class',
        select: 'className section'
      });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Collect all classes this teacher is linked to
    let classes = [];
    if (teacher.assignedClass) {
      classes.push(teacher.assignedClass);
    }
    if (teacher.assignedSubjects && teacher.assignedSubjects.length > 0) {
      classes = classes.concat(
        teacher.assignedSubjects.map(subj => subj.class).filter(Boolean)
      );
    }

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTeacher = async (req, res) => {
  const { name, email, password, phone, age, dob, gender, qualification, isClassTeacher, assignedClass, assignedSubjects, address, bio } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const teacher = await Teacher.findById(req.params.id).session(session);
    if (!teacher) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const user = await User.findById(teacher.user).session(session);
    if (user) {
      user.email = email || user.email;
      if (password) { user.password = password; }
      user.name = name || user.name;
      await user.save({ session });
    }

    teacher.name = name || teacher.name;
    teacher.phone = phone || teacher.phone;
    teacher.age = age || teacher.age;
    teacher.dob = dob || teacher.dob;
    teacher.gender = gender || teacher.gender;
    teacher.qualification = qualification || teacher.qualification;
    teacher.isClassTeacher = isClassTeacher;
    teacher.assignedClass = assignedClass || null;
    teacher.assignedSubjects = assignedSubjects || teacher.assignedSubjects;
    teacher.address = address || teacher.address;
    teacher.bio = bio || teacher.bio;
    await teacher.save({ session });
    
    if (isClassTeacher && assignedClass) {
      await Class.findByIdAndUpdate(assignedClass, { classTeacher: teacher._id }, { session });
    } else if (!isClassTeacher && teacher.assignedClass) {
      await Class.findByIdAndUpdate(teacher.assignedClass, { classTeacher: null }, { session });
    }
    
    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Teacher updated successfully', teacher });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteTeacher = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const teacher = await Teacher.findById(req.params.id).session(session);
    if (!teacher) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Teacher not found' });
    }
    await User.findByIdAndDelete(teacher.user).session(session);
    if (teacher.isClassTeacher && teacher.assignedClass) {
      await Class.findByIdAndUpdate(teacher.assignedClass, { classTeacher: null }, { session });
    }
    await teacher.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Teacher and linked user removed successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
   getMyClasses, 
};