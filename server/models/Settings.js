const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    isFirstAdminCreated: {
        type: Boolean,
        default: false
    }
});

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;