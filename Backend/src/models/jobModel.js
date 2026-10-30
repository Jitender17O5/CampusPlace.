
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    // Recruiter who posted this job
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
      index: true,
    },

    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },

    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract"],
      required: true,
    },

    workMode: {
      type: String,
      enum: ["On-site", "Remote", "Hybrid"],
      required: true,
    },

    salary: {
      type: String,
      trim: true,
      default: "",
    },

    experience: {
      type: String,
      enum: ["", "Fresher", "0-1 years", "1-3 years", "3+ years"],
      default: "",
    },

    qualification: {
      type: String,
      trim: true,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    deadline: {
      type: Date,
      required: [true, "Application deadline is required"],
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },

    requirements: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);
