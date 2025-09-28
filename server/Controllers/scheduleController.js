const Schedule = require('../models/Schedule.js');
const Class = require('../models/Class.js');
const User = require('../models/User.js');

// @desc    Admin creates a new special schedule
// @route   POST /api/schedules
const createSchedule = async (req, res) => {
  const { classId, title, description, date, startTime, endTime, type } = req.body;
  const createdBy = req.user._id;
  try {
    const newSchedule = new Schedule({
      class: classId, title, description, date, startTime, endTime, type, createdBy
    });
    await newSchedule.save();
    res.status(201).json({ message: 'Schedule created successfully', schedule: newSchedule });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get schedules for a specific class
// @route   GET /api/schedules/class/:classId
const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ class: req.params.classId })
      .populate('class', 'className section')
      .populate('createdBy', 'name');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin deletes a schedule
// @route   DELETE /api/schedules/:id
const deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createSchedule, getSchedules, deleteSchedule };