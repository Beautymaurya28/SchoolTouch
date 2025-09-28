
const Student = require('../models/Student');
const User = require('../models/User');
const Parent = require('../models/Parent');
const Class = require('../models/Class');   // ✅ import
const mongoose = require('mongoose');

// @desc    Admin adds a new student
// @route   POST /api/students
const addStudent = async (req, res) => {
  const {
    name, email, password, studentCode, rollNumber,
    classId, section, phone, address, gender, age, dob, parentPhone
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Check duplicates
    const userExists = await User.findOne({ email }).session(session);
    if (userExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const studentCodeExists = await Student.findOne({ studentCode }).session(session);
    if (studentCodeExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Student with this student code already exists' });
    }

    // 2️⃣ Create User
    const user = await User.create([{
      email,
      password,
      role: 'student',
      name,
    }], { session });

    // 3️⃣ Find or create Parent
    let parent = await Parent.findOne({ phone: parentPhone }).session(session);
    if (!parent) {
      parent = (await Parent.create([{ phone: parentPhone }], { session }))[0];
    }

    // 4️⃣ Create Student
    const student = await Student.create([{
      user: user[0]._id,
      name,
      studentCode,
      rollNumber,
      class: classId,
      section,
      phone,
      address,
      gender,
      age,
      dob,
      parent: parent._id,
    }], { session });

    // 5️⃣ Link student to parent
    if (!parent.children.includes(student[0]._id)) {
      parent.children.push(student[0]._id);
      await parent.save({ session });
    }

    // 6️⃣ Link student to class
    if (classId) {
      await Class.findByIdAndUpdate(
        classId,
        { $addToSet: { students: student[0]._id } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Student added successfully',
      student: student[0],
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Add Student Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Get all students
// @route   GET /api/students
const getStudents = async (req, res) => {
  // FIX: Destructure the query parameter as 'classId' to match the frontend call
  const { search, classId, section } = req.query; 

  try {
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    
    // FIX: Use the classId variable to filter the Mongoose document by the 'class' field
    if (classId) {
      query.class = classId; 
    }
    
    // ... (rest of the query logic remains the same)

    const students = await Student.find(query)
      .populate('user', 'email')
      .populate('parent', 'phone name')
      .populate('class', 'className section')
      .select('-__v');

    res.json(students);
  } catch (error) {
    console.error("CRITICAL CRASH: Error fetching students:", error); 
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Get a single student
// @route   GET /api/students/:id
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'email name')
      .populate('parent', 'phone name') // FIX: Ensure parent phone/name are populated
      .populate('class', 'className section');

    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    // The studentCode field is directly on the Student document, so it will be included.

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
const updateStudent = async (req, res) => {
  const {
    name, email, password, rollNumber,
    classId, section, phone, address, gender, age, dob, parentPhone
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const student = await Student.findById(req.params.id).session(session);
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Student not found' });
    }

    // 1️⃣ Update linked User
    const user = await User.findById(student.user).session(session);
    if (user) {
      user.email = email || user.email;
      if (password) user.password = password;
      user.name = name || user.name;
      await user.save({ session });
    }

    // 2️⃣ Update parent
    if (parentPhone) {
      let newParent = await Parent.findOne({ phone: parentPhone }).session(session);
      if (!newParent) {
        newParent = (await Parent.create([{ phone: parentPhone }], { session }))[0];
      }
      const oldParent = await Parent.findById(student.parent).session(session);
      if (oldParent) {
        oldParent.children.pull(student._id);
        await oldParent.save({ session });
      }
      student.parent = newParent._id;
      if (!newParent.children.includes(student._id)) {
        newParent.children.push(student._id);
        await newParent.save({ session });
      }
    }

    // 3️⃣ Handle class change
    if (classId && student.class && classId.toString() !== student.class.toString()) {
      // remove from old class
      await Class.findByIdAndUpdate(
        student.class,
        { $pull: { students: student._id } },
        { session }
      );
      // add to new class
      await Class.findByIdAndUpdate(
        classId,
        { $addToSet: { students: student._id } },
        { session }
      );
      student.class = classId;
    } else if (classId) {
      student.class = classId;
    }

    // 4️⃣ Update student doc
    student.name = name || student.name;
    student.rollNumber = rollNumber || student.rollNumber;
    student.section = section || student.section;
    student.phone = phone || student.phone;
    student.address = address || student.address;
    student.gender = gender || student.gender;
    student.age = age || student.age;
    student.dob = dob || student.dob;

    await student.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Student updated successfully', student });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Update Student Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Delete student
// @route   DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const student = await Student.findById(req.params.id).session(session);
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Student not found' });
    }

    // ❌ Remove from class
    if (student.class) {
      await Class.findByIdAndUpdate(
        student.class,
        { $pull: { students: student._id } },
        { session }
      );
    }

    await User.findByIdAndDelete(student.user).session(session);
    await Parent.findByIdAndUpdate(student.parent, { $pull: { children: student._id } }, { session });
    await student.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Student and linked data removed successfully' });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};

