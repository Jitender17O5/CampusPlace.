
const express = require("express");
const router = express.Router();

const recruiterAuthMiddleware = require(
  "../middlewares/recruiterAuthMiddleware"
);
const requireApprovedRecruiter = require(
  "../middlewares/requireApprovedRecruiter"
);
const {
  createJob,
  getAllJobs,
  getJobById,
  getRecruiterJobs,
  updateJob,
  deleteJob
} = require("../controllers/jobController");

// ================= PUBLIC ROUTES =================

// Anyone can view active jobs
router.get("/", getAllJobs);

// ================= RECRUITER ROUTES =================

// Recruiter can view their own jobs
router.get(
  "/my-jobs",
  recruiterAuthMiddleware,
  getRecruiterJobs
);

// Recruiter can post a new job
router.post(
  "/",
  recruiterAuthMiddleware,
  requireApprovedRecruiter,
  createJob
);

// Recruiter can update their own job
router.put(
  "/:id",
  recruiterAuthMiddleware,requireApprovedRecruiter,
  updateJob
);

// Recruiter can delete their own job
router.delete(
  "/:id",
  recruiterAuthMiddleware,requireApprovedRecruiter,
  deleteJob
);

// ================= JOB DETAILS =================

// Keep this after /my-jobs
router.get("/:id", getJobById);

module.exports = router;
