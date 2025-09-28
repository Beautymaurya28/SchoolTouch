const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  homework: { type: mongoose.Schema.Types.ObjectId, ref: "Homework", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  file: { type: String, required: true }, // submitted file path
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);
