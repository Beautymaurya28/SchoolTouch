const express = require('express');
const { firstAdminSignup, checkAdminStatus } = require('../Controllers/authController.js');

const router = express.Router();

router.post('/first-admin-signup', firstAdminSignup);
router.get('/check-admin-status', checkAdminStatus); // <-- The new endpoint

module.exports = router;