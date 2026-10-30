const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Student = require("../models/studentsPostData.Model");
const Recruiter = require("../models/recruiterModel");
const Admin = require("../models/adminModel");

const {
  hashOtp,
  verifyOtpHash
} = require("../utils/otpSecurity");
const PasswordReset = require("../models/passwordResetModel");

const generateOtp = require("../utils/generateOtp");
// const { hashOtp } = require("../utils/otpSecurity");

const {
  sendPasswordResetOtpEmail
} = require("../services/emailService");

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESET_EXPIRY_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

// ================= FORGOT PASSWORD =================

exports.forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;

    // Validate input
    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof role !== "string" ||
      !["student", "recruiter", "admin"].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid email and role are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Select model based on role
    const modelConfig = {
      student: {
        Model: Student,
        emailField: "collegeEmail"
      },
      recruiter: {
        Model: Recruiter,
        emailField: "email"
      },
      admin: {
        Model: Admin,
        emailField: "email"
      }
    };

    const { Model, emailField } = modelConfig[role];

    // Check account exists and is active
    const account = await Model.findOne({
      [emailField]: normalizedEmail,
      ...(role !== "admin"
        ? { isDeleted: { $ne: true } }
        : {})
    }).select("_id");

    // Generic response prevents revealing registered emails
    const genericResponse = {
      success: true,
      message:
        "If an active account exists with this email, a password reset OTP will be sent."
    };

    if (!account) {
      return res.status(200).json(genericResponse);
    }

    const now = new Date();

    // Prevent requesting OTP repeatedly
    const existingReset = await PasswordReset.findOne({
      email: normalizedEmail,
      role
    });

    if (
      existingReset &&
      now.getTime() -
        new Date(existingReset.lastSentAt).getTime() <
        RESEND_COOLDOWN_MS
    ) {
      return res.status(200).json(genericResponse);
    }

    const otp = generateOtp();

    // Separate password-reset OTP from signup OTP
    const otpHash = hashOtp(
      otp,
      normalizedEmail,
      `password-reset:${role}`
    );

    const otpExpiresAt = new Date(
      now.getTime() + OTP_EXPIRY_MS
    );

    const expiresAt = new Date(
      now.getTime() + RESET_EXPIRY_MS
    );

    // Create or replace existing reset request
    const resetRequest = await PasswordReset.findOneAndUpdate(
      {
        email: normalizedEmail,
        role,
        $or: [
          { lastSentAt: { $lte: new Date(now.getTime() - RESEND_COOLDOWN_MS) } },
          { lastSentAt: { $exists: false } }
        ]
      },
      {
        $set: {
          otpHash,
          otpExpiresAt,
          attempts: 0,
          lastSentAt: now,
          verified: false,
          resetTokenHash: null,
          resetTokenExpiresAt: null,
          expiresAt
        },
        $setOnInsert: {
          email: normalizedEmail,
          role
        }
      },
      {
        upsert: true,
        returnDocument: "after"
      }
    ).catch((error) => {
      // Concurrent requests can hit the unique index;
      // do not disclose this to the caller.
      if (error.code === 11000) return null;
      throw error;
    });

    if (!resetRequest) {
      return res.status(200).json(genericResponse);
    }

    try {
      await sendPasswordResetOtpEmail(normalizedEmail, otp);
    } catch (emailError) {
      console.error("Password reset email error:", emailError);

      // Only remove the request if it still has this OTP.
      await PasswordReset.deleteOne({
        _id: resetRequest._id,
        otpHash
      });

      return res.status(503).json({
        success: false,
        message: "Unable to send reset OTP. Please try again later."
      });
    }

    return res.status(200).json(genericResponse);

  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process password reset request"
    });
  }
};
// ================= VERIFY PASSWORD RESET OTP =================

exports.verifyPasswordResetOtp = async (req, res) => {
  try {
    const { email, role, otp } = req.body;

    // Validate inputs
    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof role !== "string" ||
      !["student", "recruiter", "admin"].includes(role) ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid email, role and 6-digit OTP are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const resetRequest = await PasswordReset.findOne({
      email: normalizedEmail,
      role
    }).select("+otpHash");

    if (!resetRequest) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset request"
      });
    }

    const now = new Date();

    // Check expiration
    if (
      resetRequest.otpExpiresAt <= now ||
      resetRequest.expiresAt <= now
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP."
      });
    }

    // Prevent reusing an already verified OTP
    if (resetRequest.verified) {
      return res.status(409).json({
        success: false,
        message: "OTP has already been verified"
      });
    }

    // Maximum 5 attempts
    if (resetRequest.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Maximum OTP attempts exceeded"
      });
    }

    const isValidOtp = verifyOtpHash(
      otp,
      normalizedEmail,
      `password-reset:${role}`,
      resetRequest.otpHash
    );

    if (!isValidOtp) {
      const updated = await PasswordReset.updateOne(
        {
          _id: resetRequest._id,
          otpHash: resetRequest.otpHash,
          verified: false,
          attempts: { $lt: 5 },
          otpExpiresAt: { $gt: new Date() },
          expiresAt: { $gt: new Date() }
        },
        {
          $inc: { attempts: 1 }
        }
      );

      if (updated.modifiedCount !== 1) {
        return res.status(409).json({
          success: false,
          message: "OTP expired, changed, or attempt limit reached"
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the SHA-256 hash
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token valid for 10 minutes, but never beyond request expiry
    const resetTokenExpiresAt = new Date(
      Math.min(
        Date.now() + 10 * 60 * 1000,
        resetRequest.expiresAt.getTime()
      )
    );

    // Atomically mark OTP as verified
    const verifiedRequest = await PasswordReset.findOneAndUpdate(
      {
        _id: resetRequest._id,
        otpHash: resetRequest.otpHash,
        verified: false,
        attempts: { $lt: 5 },
        otpExpiresAt: { $gt: new Date() },
        expiresAt: { $gt: new Date() }
      },
      {
        $set: {
          verified: true,
          resetTokenHash,
          resetTokenExpiresAt
        }
      },
      {
        returnDocument: "after"
      }
    );

    if (!verifiedRequest) {
      return res.status(409).json({
        success: false,
        message: "OTP expired or already verified"
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
      expiresInSeconds: Math.max(
        0,
        Math.floor(
          (resetTokenExpiresAt.getTime() - Date.now()) / 1000
        )
      )
    });

  } catch (error) {
    console.error("Verify password reset OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed"
    });
  }
};

// ================= RESET PASSWORD =================

exports.resetPassword = async (req, res) => {
  try {
    const {
      email,
      role,
      resetToken,
      newPassword,
      confirmPassword
    } = req.body;

    // Validate inputs
    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      !["student", "recruiter", "admin"].includes(role) ||
      typeof resetToken !== "string" ||
      !/^[a-f0-9]{64}$/i.test(resetToken) ||
      typeof newPassword !== "string" ||
      newPassword.length < 8 ||
      newPassword !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset details or passwords do not match"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Hash the reset token received from the client
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Find a valid verified reset request
    const resetRequest = await PasswordReset.findOne({
      email: normalizedEmail,
      role,
      verified: true,
      resetTokenHash,
      resetTokenExpiresAt: { $gt: new Date() },
      expiresAt: { $gt: new Date() }
    });

    if (!resetRequest) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Select account model
    const modelConfig = {
      student: {
        Model: Student,
        emailField: "collegeEmail"
      },
      recruiter: {
        Model: Recruiter,
        emailField: "email"
      },
      admin: {
        Model: Admin,
        emailField: "email"
      }
    };

    const { Model, emailField } = modelConfig[role];

    const account = await Model.findOne({
      [emailField]: normalizedEmail,
      ...(role !== "admin"
        ? { isDeleted: { $ne: true } }
        : {})
    });

    if (!account) {
      return res.status(400).json({
        success: false,
        message: "Unable to reset password"
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Atomically claim the reset token so it cannot be reused
    const claimed = await PasswordReset.findOneAndDelete({
      _id: resetRequest._id,
      verified: true,
      resetTokenHash,
      resetTokenExpiresAt: { $gt: new Date() },
      expiresAt: { $gt: new Date() }
    });

    if (!claimed) {
      return res.status(400).json({
        success: false,
        message: "Reset token has already been used or expired"
      });
    }

    // Update account password
    account.password = hashedPassword;
    await account.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in again."
    });

  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Password reset failed"
    });
  }
};