const FeesStructure = require('../models/FeeStructure.js');
const FeesRecord = require('../models/FeeRecord.js');
const Student = require('../models/Student.js');
const Parent = require('../models/Parent.js');
const Class = require('../models/Class.js');
const Teacher = require('../models/Teacher.js');
// Create or update fee structure
const createFeeStructure = async (req, res) => {
  const { classId, feeType, amount, dueDate } = req.body;
  try {
    const feesStructure = await FeesStructure.findOneAndUpdate(
      { class: classId, feeType },
      { amount, dueDate },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json({ message: 'Fee structure created successfully', feesStructure });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all fee structures
const getFeeStructures = async (req, res) => {
  try {
    const structures = await FeesStructure.find()
      .populate('class', 'className section'); // Populate class info
    res.status(200).json(structures);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getParentById = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id).populate("children", "name studentCode class");
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }
    res.json(parent);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Record a payment
const recordPayment = async (req, res) => {
  const { studentId, feesStructureId, paidAmount, paymentStatus, receiptId } = req.body;
  try {
    const newPayment = new FeesRecord({
      student: studentId,
      feesStructure: feesStructureId,
      paidAmount,
      paymentStatus,
      receiptId,
      paymentDate: new Date()
    });
    await newPayment.save();
    res.status(201).json({ message: 'Payment recorded successfully', record: newPayment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get child fee details (parent/student view)
const getChildFeeDetails = async (req, res) => {
  const { studentId } = req.params;
  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    
    const feeStructure = await FeesStructure.find({ class: student.class });
    const payments = await FeesRecord.find({
      student: studentId,
      feesStructure: { $in: feeStructure.map(fs => fs._id) }
    });

    const feeDetails = feeStructure.map(fs => {
      const paid = payments
        .filter(p => p.feesStructure.toString() === fs._id.toString())
        .reduce((sum, p) => sum + p.paidAmount, 0);

      return {
        feeType: fs.feeType,
        amount: fs.amount,
        dueDate: fs.dueDate,
        paidAmount: paid,
        status: paid >= fs.amount ? 'Paid' : 'Pending'
      };
    });

    res.json(feeDetails);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get overall fees summary (admin view)
// In controllers/feesController.js, replace the getFeesSummary function

const getFeesSummary = async (req, res) => {
  try {
    // 1. Financial Stats
    const totalFeesStructure = await FeesStructure.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
    const totalPaidRecords = await FeesRecord.countDocuments({ paymentStatus: 'Paid' });
    const totalPendingRecords = await FeesRecord.countDocuments({ paymentStatus: 'Pending' });

    // 2. User Stats
    const studentCount = await Student.countDocuments();
    const teacherCount = await Teacher.countDocuments();
    const parentCount = await Parent.countDocuments();
    const classCount = await Class.countDocuments();

    // 3. Calculation for total collected amount (more precise)
    const totalAmountPaidResult = await FeesRecord.aggregate([
        { $match: { paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } }
    ]);

    res.json({
        totalStudents: studentCount,
        totalTeachers: teacherCount,
        totalParents: parentCount,
        totalClasses: classCount,
        
        paidCount: totalPaidRecords,
        pendingCount: totalPendingRecords,
        totalAmountPaid: totalAmountPaidResult[0]?.total || 0,
        // Using a basic approximation for Total Due for the dashboard view
        totalPendingAmount: (totalFeesStructure[0]?.total || 0) - (totalAmountPaidResult[0]?.total || 0)
    });
  } catch (error) {
    console.error("Error fetching fees summary:", error);
    res.status(500).json({ message: 'Server error while fetching summary.', error: error.message });
  }
};

// Ensure all models are imported at the top (FeesStructure, FeesRecord, Student, Teacher, Parent, Class)

// Get payment records (admin view)
const getPaymentRecords = async (req, res) => {
  try {
    const payments = await FeesRecord.find()
      .populate('student', 'name studentCode')
      .populate('feesStructure', 'feeType amount dueDate');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createFeeStructure,
  getFeeStructures, // added
  recordPayment,
  getChildFeeDetails,
  getFeesSummary,
  getParentById,
  getPaymentRecords
};
