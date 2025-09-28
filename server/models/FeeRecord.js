const mongoose = require("mongoose");

const feesRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  feesStructure: { type: mongoose.Schema.Types.ObjectId, ref: "FeesStructure", required: true },
  paidAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ["Paid", "Pending", "Partially Paid"], default: "Pending" },
  paymentDate: Date,
  receiptId: String,
});

const FeesRecord = mongoose.model("FeesRecord", feesRecordSchema);
module.exports = FeesRecord;
