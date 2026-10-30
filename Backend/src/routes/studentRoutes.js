const express = require("express");

const {
  registerStudent,
  verifyStudentEmail,
  login,
  resendStudentOtp
} = require("../controllers/studentControllers");

const {
  getProfile,
  updateProfile
} = require("../controllers/studentProfileController");

const {
  uploadStudentResume,
  getStudentResume
} = require("../controllers/studentResumeController");

const studentAuth = require(
  "../middlewares/studentAuth"
);

const studentResumeUpload = require(
  "../middlewares/studentResumeUpload"
);

const route = express.Router();

// Public routes
route.post("/register", registerStudent);
route.post("/verify-email", verifyStudentEmail);
route.post("/login", login);
route.post("/resend-otp", resendStudentOtp);

// Protected profile routes
route.get("/profile", studentAuth, getProfile);
route.patch("/profile", studentAuth, updateProfile);

// Protected resume routes
route.patch(
  "/resume",
  studentAuth,
  studentResumeUpload.single("resume"),
  uploadStudentResume
);

route.get(
  "/resume",
  studentAuth,
  getStudentResume
);

module.exports = route;