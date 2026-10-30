const mongoose = require("mongoose");

const pendingRegistrationSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["student", "recruiter"],
      required: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    registrationData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      select: false
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

    registrationExpiresAt: {
      type: Date,
      required: true
    },

    attempts: {
      type: Number,
      default: 0
    },

    emailSent: {
      type: Boolean,
      default: false
    },

    lastSentAt: {
      type: Date,
      default: Date.now
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "processing"],
      default: "pending"
    },

    verificationLockedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// One pending registration per email and role
pendingRegistrationSchema.index(
  { email: 1, role: 1 },
  { unique: true }
);

// Automatically delete expired pending registrations
pendingRegistrationSchema.index(
  { registrationExpiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model(
  "PendingRegistration",
  pendingRegistrationSchema
);