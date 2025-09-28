const Razorpay = require("razorpay");
const crypto = require("crypto");
const FeesRecord = require("../models/FeeRecord.js");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  const { amount } = req.body;
  try {
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error creating Razorpay order", error: error.message });
  }
};

const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentId, feesStructureId, paidAmount } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");

  if (expectedSignature === razorpay_signature) {
    try {
      const paymentRecord = new FeesRecord({
        student: studentId,
        feesStructure: feesStructureId,
        paidAmount,
        paymentStatus: "Paid",
        receiptId: razorpay_payment_id,
        paymentDate: new Date(),
      });
      await paymentRecord.save();
      res.json({ message: "Payment verified successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error saving payment record", error: error.message });
    }
  } else {
    res.status(400).json({ message: "Invalid payment signature" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
