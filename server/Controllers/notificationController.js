const Notification = require('../models/Notification');
const User = require('../models/User');
const Student = require('../models/Student');
const Parent = require('../models/Parent');

// @desc    Admin/Teacher sends a new announcement
// @route   POST /api/notifications
const sendNotification = async (req, res) => {
  const { message, targetRole, targetClass, recipientIds } = req.body;
  const senderId = req.user._id;
  const senderRole = req.user.role;

  try {
    let recipients = [];
    if (targetRole === 'all') {
      recipients = await User.find({}).select('_id');
    } else if (targetRole === 'class') {
      if (!targetClass) {
        return res.status(400).json({ message: 'Target class ID is required.' });
      }
      const students = await Student.find({ class: targetClass }).populate('user');
      recipients = students.map(s => s.user._id);
      const teachers = await User.find({ role: 'teacher' }); // Optional: Send to all teachers
      recipients = [...recipients, ...teachers.map(t => t._id)];
    } else if (recipientIds) {
      recipients = recipientIds; // Send to specific users
    } else {
        // Find all users with the specified role
        const users = await User.find({ role: targetRole }).select('_id');
        recipients = users.map(u => u._id);
    }

    const newNotification = new Notification({
      sender: senderId,
      senderRole,
      message,
      targetRole,
      targetClass,
      recipients, // Store the final list of user IDs
    });
    await newNotification.save();

    res.status(201).json({ message: 'Announcement sent successfully', notification: newNotification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get notifications for the logged-in user
// @route   GET /api/notifications/me
const getMyNotifications = async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  try {
    let classId = null;
    if (userRole === 'student') {
      const student = await Student.findOne({ user: userId }).select('class');
      if (student) classId = student.class;
    }

    // Find notifications where user is an explicit recipient, or it's a general announcement
    const notifications = await Notification.find({
      $or: [
        { recipients: userId },
        { targetRole: 'all' },
        (classId ? { targetClass: classId } : null)
      ],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'email')
      .select('-recipients');

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  sendNotification,
  getMyNotifications,
};