const Announcement = require('../models/Announcement.js');
const Student = require('../models/Student.js');
const Teacher = require('../models/Teacher.js');
const Parent = require('../models/Parent.js');
const Class = require('../models/Class.js');

// CREATE ANNOUNCEMENT
const createAnnouncement = async (req, res) => {
    const { title, description, targetClass, targetRole, attachment, date, time } = req.body;
    const createdBy = req.user.id;
    const role = req.user.role;

    try {
        const newAnnouncement = new Announcement({
            title,
            description,
            createdBy,
            role,
            targetClass: targetRole === 'class' ? targetClass : null,
            targetRole,
            attachment,
            date,
            time
        });

        await newAnnouncement.save();
        res.status(201).json({ message: 'Announcement created successfully', announcement: newAnnouncement });
    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET ANNOUNCEMENTS (role-based)
const getAnnouncements = async (req, res) => {
    const { role, profileId } = req.user;
    let query = {};

    try {
        if (role === "student") {
            const student = await Student.findById(profileId);
            if (!student) return res.status(404).json({ message: "Student not found" });

            query = {
                $or: [
                    { targetClass: student.class },
                    { targetRole: "all" },
                    { targetRole: "student" }
                ]
            };

        } else if (role === "parent") {
            const parent = await Parent.findById(profileId).populate("children");
            if (!parent) return res.status(404).json({ message: "Parent not found" });

            const children = Array.isArray(parent.children) ? parent.children : [parent.children];
            const childClasses = children.map(c => c?.class).filter(c => c);

            if (childClasses.length === 0) return res.status(404).json({ message: "No linked student classes found" });

            query = {
                $or: [
                    { targetClass: { $in: childClasses } },
                    { targetRole: "all" },
                    { targetRole: "parent" }
                ]
            };

        } else if (role === "teacher") {
            const teacher = await Teacher.findById(profileId).populate('assignedClass assignedSubjects.class');
            if (!teacher) return res.status(404).json({ message: "Teacher not found" });

            const assignedClassIds = [];
            if (teacher.isClassTeacher && teacher.assignedClass) assignedClassIds.push(teacher.assignedClass._id);
            if (Array.isArray(teacher.assignedSubjects)) {
                teacher.assignedSubjects.forEach(s => {
                    if (s?.class?._id) assignedClassIds.push(s.class._id);
                });
            }

            query = {
                $or: [
                    { targetClass: { $in: assignedClassIds } },
                    { targetRole: "all" },
                    { targetRole: "teacher" }
                ]
            };

        } else if (role === "admin") {
            query = {}; // Admin sees all announcements
        } else {
            return res.status(403).json({ message: "Invalid role" });
        }

        const announcements = await Announcement.find(query)
            .populate("createdBy", "name")
            .populate("targetClass", "className section");

        res.json(announcements);

    } catch (error) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET TEACHER CLASSES (for dropdown)
const getTeacherClasses = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.profileId).populate('assignedClass assignedSubjects.class');
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        const assignedClassIds = [];
        if (teacher.isClassTeacher && teacher.assignedClass) assignedClassIds.push(teacher.assignedClass._id);
        if (Array.isArray(teacher.assignedSubjects)) {
            teacher.assignedSubjects.forEach(s => {
                if (s?.class?._id) assignedClassIds.push(s.class._id);
            });
        }

        const classes = await Class.find({ _id: { $in: assignedClassIds } })
            .select('_id className section');

        res.json({ classes });
    } catch (error) {
        console.error("Error fetching teacher classes:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET ANNOUNCEMENTS FOR ADMIN
const getAnnouncementsForAdmin = async (req, res) => {
    try {
        const announcements = await Announcement.find({})
            .populate('createdBy', 'name')
            .populate('targetClass', 'className section');
        res.json(announcements);
    } catch (error) {
        console.error("Error fetching admin announcements:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// UPDATE ANNOUNCEMENT
const updateAnnouncement = async (req, res) => {
    const { id } = req.params;
    const { title, description, targetClass, targetRole, date, time, attachment } = req.body;

    try {
        const announcement = await Announcement.findById(id);
        if (!announcement) return res.status(404).json({ message: 'Announcement not found.' });

        if (announcement.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'You can only edit your own announcements.' });
        }

        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            id,
            { title, description, targetClass, targetRole, date, time, attachment },
            { new: true }
        );

        res.json({ message: 'Announcement updated successfully', announcement: updatedAnnouncement });

    } catch (error) {
        console.error("Error updating announcement:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// DELETE ANNOUNCEMENT
const deleteAnnouncement = async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error("Error deleting announcement:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createAnnouncement,
    getAnnouncements,
    getAnnouncementsForAdmin,
    getTeacherClasses,
    updateAnnouncement,
    deleteAnnouncement
};
