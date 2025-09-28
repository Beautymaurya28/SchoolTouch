const express = require('express');
const { getMyProfile, updateMyProfile } = require('../Controllers/userProfileController.js');
const { protect } = require('../middleware/auth.js');

const router = express.Router();

router.route('/')
    .get(protect, getMyProfile)
    .put(protect, updateMyProfile);

module.exports = router;