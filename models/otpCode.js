const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 4,
  },
  email: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function () {
      return new Date(Date.now() + 15 * 60 * 1000);
    },
  },
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
