
const mongoose = require("mongoose");

const recruiter = new mongoose.Schema({
  // ========== REGISTRATION DETAILS ==========

  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true
  },

  userId: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true
  },

  companyName: {
    type: String,
    required: true,
    trim: true
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    select: false
  },

  designation: {
    type: String,
    required: true
  },

  // ========== COMPANY PROFILE DETAILS ==========

  companyLogo: {
    type: String,
    default: ""
  },

  companyLogoFileId: {
    type: String,
    default: ""
  },
  // Company background banner URL
  companyBanner: {
    type: String,
    default: ""
  },

  // ImageKit file ID for deleting the previous banner
  companyBannerFileId: {
    type: String,
    default: ""
  },

  industry: {
    type: String,
    default: ""
  },

  companyWebsite: {
    type: String,
    default: ""
  },

  companyLocation: {
    type: String,
    default: ""
  },

  companySize: {
    type: String,
    default: ""
  },

  foundedYear: {
    type: Number,
    default: null
  },

  companyDescription: {
    type: String,
    default: ""
  },

  companyLinkedin: {
    type: String,
    default: ""
  },

  companyPhone: {
    type: String,
    default: ""
  },
  // ========== ACCOUNT STATUS ==========

  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: {
    type: Date,
    default: null
  },

  // ========== ADMIN APPROVAL STATUS ==========

 // ========== PROFILE COMPLETION ==========

isProfileCompleted: {
  type: Boolean,
  default: false
},

// ========== ADMIN APPROVAL ==========

approvalStatus: {
  type: String,
  enum: [
    "not_requested",
    "pending",
    "approved",
    "rejected"
  ],
  default: "not_requested"
},

approvalRequestedAt: {
  type: Date,
  default: null
},

}, { timestamps: true });

const recruiterSchema = mongoose.model("Recruiter", recruiter);

module.exports = recruiterSchema;
