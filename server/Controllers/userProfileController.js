const User = require('../models/User.js');
const Admin = require('../models/Admin.js');
const Teacher = require('../models/Teacher.js');
const Student = require('../models/Student.js');
const Parent = require('../models/Parent.js');

// @desc    Get complete profile data for the logged-in user (Admin, Teacher, Student, Parent)
// @route   GET /api/profile
const getMyProfile = async (req, res) => {
    const { id: userId, profileId, role } = req.user;

    try {
        // Fetch the base User data (email, name, role)
        const baseUser = await User.findById(userId).select('-password');
        if (!baseUser) return res.status(404).json({ message: 'User not found.' });

        let profileData;

        // Fetch Role-Specific Data
        if (role === 'admin') {
            profileData = await Admin.findOne({ user: userId });
        } else if (role === 'teacher') {
            profileData = await Teacher.findById(profileId)
                .populate('assignedSubjects.subject', 'subjectName')
                .populate('assignedClass', 'className section');
        } else if (role === 'student') {
            profileData = await Student.findById(profileId)
                .populate('class', 'className section')
                .populate('parent', 'name phone');
        } else if (role === 'parent') {
            profileData = await Parent.findById(profileId)
                .populate({
                    path: 'children',
                    select: 'name class rollNumber',
                    populate: { path: 'class', select: 'className section' }
                });
        }

        // Combine base user data with role-specific data
        const response = {
            baseInfo: baseUser,
            details: profileData,
            // Add a placeholder for stats/analytics if needed later
            analytics: {
                attendance: '75%', 
                rank: 'Top 10'
            }
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update a user's base profile fields
// @route   PUT /api/profile
const updateMyProfile = async (req, res) => {
    // Logic for updating base user fields and specific profile fields (Teacher, Student, Parent)
    // This function will be very long due to conditional logic for each role/model.
    // For now, we return a success placeholder.
    res.json({ message: 'Profile update logic needs to be implemented. Data received.' });
};


module.exports = { getMyProfile, updateMyProfile };