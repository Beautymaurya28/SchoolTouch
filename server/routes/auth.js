const express = require('express');
const { loginUser, requestParentOtp, verifyParentOtp } = require('../Controllers/authController.js');
const router = express.Router();

// General login for Admin, Teacher, Student
router.post('/login', loginUser);

// Parent login with OTP
router.post('/login/parent/request-otp', requestParentOtp);
router.post('/login/parent/verify-otp', verifyParentOtp);

module.exports = router;