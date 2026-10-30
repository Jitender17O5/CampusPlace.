const mongoose = require('mongoose')

const studentPostSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true
  },

  collegeEmail: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
  },

  rollNo: {
    type: String,
    required: [true, "Roll number is required"],
    unique: true,
    trim: true
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    default: ""
  },

  linkedin: {
    type: String,
    trim: true,
    default: ""
  },

  github: {
    type: String,
    trim: true,
    default: ""
  },

  address: {
    type: String,
    trim: true,
    default: ""
  },

  course: {
    type: String,
    trim: true,
    default: ""
  },

  college: {
    type: String,
    trim: true,
    default: ""
  },

  startYear: {
    type: String,
    default: ""
  },

  endYear: {
    type: String,
    default: ""
  },

  cgpa: {
    type: String,
    default: ""
  },

  about: {
    type: String,
    trim: true,
    default: ""
  },

  skills: {
    type: [String],
    default: []
  },
  // Student Resume
resumeUrl: {
  type: String,
  default: ""
},

resumeFileId: {
  type: String,
  default: ""
},

isDeleted: {
  type: Boolean,
  default: false
},

deletedAt: {
  type: Date,
  default: null
}
});



const studentPostModel = mongoose.model("student", studentPostSchema)
module.exports = studentPostModel 