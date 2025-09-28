const Parent = require('../models/Parent');
const User = require('../models/User');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// @desc    Admin adds a new parent account
// @route   POST /api/parents
const addParent = async (req, res) => {
  const { name, email, password, phone, address, studentIds } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userExists = await User.findOne({ email }).session(session);
    const parentPhoneExists = await Parent.findOne({ phone }).session(session);
    if (userExists || parentPhoneExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'User with this email or phone number already exists' });
    }

    // 1. Create the User account
    const user = await User.create([{
      name,
      email,
      password,
      role: 'parent',
    }], { session });

    // 2. Create the Parent document and link it to the User
    const newParent = await Parent.create([{
      user: user[0]._id,
      name,
      email,
      phone,
      address,
      children: studentIds,
    }], { session });

    // 3. Link the students to the new parent
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { parent: newParent[0]._id },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ message: 'Parent account created and linked successfully.', parent: newParent[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin gets all parent accounts with search
// @route   GET /api/parents
const getParents = async (req, res) => {
  const { search } = req.query;
  try {
    let query = {};
    if (search) {
      // Search by name or student name
      const students = await Student.find({ name: { $regex: search, $options: 'i' } });
      const studentParentIds = students.map(s => s.parent);
      query = {
          $or: [
              { name: { $regex: search, $options: 'i' } },
              { _id: { $in: studentParentIds } }
          ]
      };
    }
    const parents = await Parent.find(query)
      .populate('children', 'name studentCode')
      .select('-__v');
    res.json(parents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



const getParentById = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id).populate("children", "name class");
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }
    res.json(parent);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Admin updates a parent's details
// @route   PUT /api/parents/:id
const updateParent = async (req, res) => {
  const { name, email, password, phone, address, studentIds } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const parent = await Parent.findById(req.params.id).session(session);
    if (!parent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Parent not found' });
    }

    const user = await User.findById(parent.user).session(session);
    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      if (password) {
        user.password = password; // The `pre('save')` middleware will hash this
      }
      await user.save({ session });
    }

    parent.name = name || parent.name;
    parent.email = email || parent.email;
    parent.phone = phone || parent.phone;
    parent.address = address || parent.address;

    // Unlink old students and link new ones
    await Student.updateMany({ parent: parent._id }, { parent: null }, { session });
    await Student.updateMany({ _id: { $in: studentIds } }, { parent: parent._id }, { session });

    parent.children = studentIds;
    await parent.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Parent updated successfully', parent });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin deletes a parent account
// @route   DELETE /api/parents/:id
const deleteParent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const parent = await Parent.findById(req.params.id).session(session);
    if (!parent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Parent not found' });
    }

    await User.findByIdAndDelete(parent.user).session(session);
    await Student.updateMany({ parent: parent._id }, { parent: null }, { session });
    await parent.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Parent deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addParent,
  getParents,
  updateParent,
  deleteParent,
  getParentById,
};