const express = require("express");
const {
  setTimetable,
  getClassTimetable,
  getTeacherTimetable,
  getUnifiedTimetable,
  getMyTimetable, // ✅ new
} = require("../Controllers/timetableController.js");

const { protect, authorize } = require("../middleware/auth.js");
const router = express.Router();

// Admin routes for creating/updating timetables
router.post("/", protect, authorize("admin"), setTimetable);

router.get("/class/:classId", protect, authorize("admin", "teacher", "student", "parent"), getClassTimetable);
router.get("/teacher/:teacherId", protect, authorize("teacher"), getTeacherTimetable);
router.get("/unified/class/:classId", protect, authorize("admin", "teacher", "student", "parent"), getUnifiedTimetable);

// ✅ New route for students/parents/teachers
router.get("/my-timetable", protect, authorize("student", "parent", "teacher"), getMyTimetable);

module.exports = router;
