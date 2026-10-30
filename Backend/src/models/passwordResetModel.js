const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    role: {
      type: String,
      enum: ["student", "recruiter", "admin"],
      required: true
    },

    otpHash: {
      type: String,
      required: true,
      select: false
    },

    otpExpiresAt: {
      type: Date,
      required: true
    },

    attempts: {
      type: Number,
      default: 0
    },

    lastSentAt: {
      type: Date,
      default: Date.now
    },

    // Used after OTP verification
    verified: {
      type: Boolean,
      default: false
    },

    resetTokenHash: {
      type: String,
      select: false,
      default: null
    },

    resetTokenExpiresAt: {
      type: Date,
      default: null
    },

    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// One active reset request per email and role
passwordResetSchema.index(
  { email: 1, role: 1 },
  { unique: true }
);

// Automatically remove expired reset requests
passwordResetSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model(
  "PasswordReset",
  passwordResetSchema
);