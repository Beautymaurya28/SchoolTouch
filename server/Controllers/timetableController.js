const Timetable = require('../models/Timetable');
const Schedule = require('../models/Schedule');

// Set / update timetable
const setTimetable = async (req, res) => {
  const { classId, schedule } = req.body;
  try {
    const timetable = await Timetable.findOneAndUpdate(
      { class: classId },
      { class: classId, schedule },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json({ message: 'Timetable set successfully', timetable });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get class timetable (regular only)
const getClassTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ class: req.params.classId })
      .populate('class', 'className section')
      .populate('schedule.periods.subject', 'subjectName')
      .populate('schedule.periods.teacher', 'name');

    if (!timetable) return res.status(404).json({ message: 'Timetable not found.' });

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyTimetable = async (req, res) => {
  try {
    let classId = null;

    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user.id });
      if (!student) return res.status(404).json({ message: "Student not found" });
      classId = student.classId;
    }

    if (req.user.role === "parent") {
      const parent = await Parent.findOne({ user: req.user.id }).populate("children");
      if (!parent || !parent.children.length)
        return res.status(404).json({ message: "No children found for parent" });
      classId = parent.children[0].classId; // assuming first child’s class
    }

    if (req.user.role === "teacher") {
      const teacher = await Teacher.findOne({ user: req.user.id });
      if (!teacher) return res.status(404).json({ message: "Teacher not found" });
      classId = teacher.assignedClassId; // adjust based on your teacher model
    }

    if (!classId) return res.status(404).json({ message: "Class not found" });

    const timetableDoc = await Timetable.findOne({ class: classId })
      .populate("class", "className section")
      .populate("schedule.periods.subject", "subjectName")
      .populate("schedule.periods.teacher", "name");

    const schedules = await Schedule.find({ class: classId });

    if (!timetableDoc && schedules.length === 0) {
      return res.status(404).json({ message: "No timetable or schedule found" });
    }

    const formattedSchedules = schedules.map((event) => ({
      day: event?.day || "Special Event",
      type: "event",
      periods: [
        {
          periodNumber: null,
          startTime: event?.startTime || null,
          endTime: event?.endTime || null,
          time: event?.time || null,
          name: event?.name || "Unnamed Event",
          teacher: null,
          subject: null,
        },
      ],
    }));

    const formattedTimetable = timetableDoc?.schedule?.map((day) => ({
      ...day._doc,
      type: "class",
    })) || [];

    res.json({
      timetable: formattedTimetable,
      schedules: formattedSchedules,
    });
  } catch (error) {
    console.error("Error in getMyTimetable:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get teacher timetable
const getTeacherTimetable = async (req, res) => {
  try {
    const teacherTimetables = await Timetable.find({ 'schedule.periods.teacher': req.params.teacherId })
      .populate('class', 'className section')
      .populate('schedule.periods.subject', 'subjectName')
      .populate('schedule.periods.teacher', 'name');

    if (!teacherTimetables) return res.status(404).json({ message: 'Timetable not found.' });

    res.json(teacherTimetables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get unified timetable (classes + special events)
const getUnifiedTimetable = async (req, res) => {
  const { classId } = req.params;
  try {
    const timetable = await Timetable.findOne({ class: classId })
      .populate('class', 'className section')
      .populate('schedule.periods.subject', 'subjectName')
      .populate('schedule.periods.teacher', 'name');

    const schedules = await Schedule.find({ class: classId });

    if (!timetable && schedules.length === 0) {
      return res.status(404).json({ message: 'No timetable or schedule found.' });
    }

    // Format special events like periods
    const formattedSchedules = schedules.map(event => ({
      day: event?.day || 'Special Event',
      type: 'event',
      periods: [{
        periodNumber: null,
        startTime: event?.startTime || null,
        endTime: event?.endTime || null,
        time: event?.time || null,
        name: event?.name || 'Unnamed Event',
        teacher: null,
        subject: null
      }]
    }));

    const formattedTimetable = timetable?.schedule?.map(day => ({
      ...day._doc,
      type: 'class'
    })) || [];

    res.json({
      timetable: formattedTimetable,
      schedules: formattedSchedules
    });
  } catch (error) {
    console.error('Error in getUnifiedTimetable:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { setTimetable, getClassTimetable, getTeacherTimetable, getUnifiedTimetable, getMyTimetable };
