const express = require("express");

const {
  forgotPassword,
  verifyPasswordResetOtp,
  resetPassword
} = require("../controllers/passwordController");

const router = express.Router();

router.post("/forgot", forgotPassword);

router.post("/verify-otp", verifyPasswordResetOtp);
router.post("/reset", resetPassword);

module.exports = router;