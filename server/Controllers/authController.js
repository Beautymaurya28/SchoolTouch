const User = require('../models/User.js');
const Parent = require('../models/Parent.js');
const Student = require('../models/Student.js');
const Teacher = require('../models/Teacher.js');
const Admin = require('../models/Admin.js');
const Settings = require('../models/Settings.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Function to generate a JWT token with profileId in the payload
const generateToken = (id, role, profileId) => {
  return jwt.sign({ id, role, profileId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// @desc    Check if the first admin has been created
// @route   GET /api/public/check-admin-status
const checkAdminStatus = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        const isFirstAdminCreated = settings ? settings.isFirstAdminCreated : false;
        res.json({ isFirstAdminCreated });
    } catch (error) {
        console.error("Error in checkAdminStatus:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create the very first admin user (one-time use)
// @route   POST /api/public/first-admin-signup
const firstAdminSignup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const settings = await Settings.findOne();
        if (settings && settings.isFirstAdminCreated) {
            return res.status(403).json({ message: 'The first admin has already been created.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }
        
        const newAdminUser = new User({
            email,
            password,
            role: 'admin',
            name
        });
        await newAdminUser.save();

        const adminProfile = new Admin({
            user: newAdminUser._id,
            name
        });
        await adminProfile.save();
        
        if (!settings) {
            await Settings.create({ isFirstAdminCreated: true });
        } else {
            settings.isFirstAdminCreated = true;
            await settings.save();
        }
        
        const token = generateToken(newAdminUser._id, newAdminUser.role, adminProfile._id);

        res.status(201).json({
          message: 'First admin account created successfully!',
          token,
          role: newAdminUser.role,
          profileId: adminProfile._id
        });

    } catch (error) {
        console.error("Error in firstAdminSignup:", error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
};

// @desc    Login a user (Admin, Teacher, Student, Parent)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password, role, studentCode, phone } = req.body;

  try {
    let user;
    let profileId = null;

    if (role === 'student') {
      const student = await Student.findOne({ studentCode }).populate('user');
      if (!student || !(await student.user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      user = student.user;
      profileId = student._id;
    } else {
      user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      if (user.role === 'teacher') {
        const teacher = await Teacher.findOne({ user: user._id });
        if (teacher) profileId = teacher._id;
      } else if (user.role === 'admin') {
        const admin = await Admin.findOne({ user: user._id });
        if (admin) profileId = admin._id;
      }
    }

    const token = generateToken(user._id, user.role, profileId);

    res.json({
      token,
      role: user.role,
      user: { id: user._id, email: user.email },
      profileId: profileId,
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request OTP for parent login
// @route   POST /api/auth/login/parent/request-otp
const requestParentOtp = async (req, res) => {
  const { phone } = req.body;

  try {
    const parent = await Parent.findOne({ phone }).populate('user');
    if (!parent || !parent.user) {
      return res.status(404).json({ message: 'Parent not found with this phone number' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    parent.otp = otp;
    parent.otpExpires = Date.now() + 10 * 60 * 1000;
    await parent.save();

    console.log(`OTP for ${phone}: ${otp}`);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error("Error in requestParentOtp:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify OTP for parent login
// @route   POST /api/auth/login/parent/verify-otp
const verifyParentOtp = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const parent = await Parent.findOne({
      phone,
      otp,
      otpExpires: { $gt: Date.now() },
    }).populate('user');

    if (!parent) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    parent.otp = undefined;
    parent.otpExpires = undefined;
    await parent.save();

    const token = generateToken(parent.user._id, 'parent', parent._id);

    res.json({
      token,
      role: 'parent',
      user: { id: parent.user._id, email: parent.user.email },
      profileId: parent._id,
    });
  } catch (error) {
    console.error("Error in verifyParentOtp:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { loginUser, requestParentOtp, verifyParentOtp, firstAdminSignup, checkAdminStatus };