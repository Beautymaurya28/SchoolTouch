const mongoose = require("mongoose");

const feeSettingsSchema = new mongoose.Schema({
  upiQrUrl: { type: String, required: true }, // URL of QR code image
});

const FeeSettings = mongoose.model("FeeSettings", feeSettingsSchema);
module.exports = FeeSettings;
