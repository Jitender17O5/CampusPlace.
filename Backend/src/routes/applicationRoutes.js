
const express = require("express");
const router = express.Router();

// Authentication middlewares
const studentAuth = require("../middlewares/studentAuth");

const recruiterAuthMiddleware = require(
  "../middlewares/recruiterAuthMiddleware"
);

// Application controllers
const {
  applyJob,
  getMyApplications,
  getJobApplicants,
  getRecruiterApplicants
} = require("../controllers/applicationController");

// ================= STUDENT ROUTES =================

// Student applies for a job
router.post(
  "/:jobId",
  studentAuth,
  applyJob
);

// Student views their applications
router.get(
  "/",
  studentAuth,
  getMyApplications
);

// ================= RECRUITER ROUTES =================

// Recruiter views applicants for their job
router.get(
  "/job/:jobId",
  recruiterAuthMiddleware,
  getJobApplicants
);
router.get(
  "/recruiter/all",
  recruiterAuthMiddleware,
  getRecruiterApplicants
);
module.exports = router;
