const express = require("express");
const { createOrder, verifyPayment } = require("../Controllers/paymentController.js");
const { protect, authorize } = require("../middleware/auth.js");

const router = express.Router();

router.post("/order", protect, authorize("parent", "student"), createOrder);
router.post("/verify", protect, authorize("parent", "student"), verifyPayment);

module.exports = router;
