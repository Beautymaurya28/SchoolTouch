const mongoose = require("mongoose");

const feesStructureSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  feeType: { type: String, enum: ["Tuition", "Exam", "Transport", "Other"], required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
});

const FeesStructure = mongoose.model("FeesStructure", feesStructureSchema);
module.exports = FeesStructure;
