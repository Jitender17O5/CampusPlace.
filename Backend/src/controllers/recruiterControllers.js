const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const recruiterSchema = require('../models/recruiterModel')

const PendingRegistration = require("../models/pendingRegistrationModel");
const generateOtp = require("../utils/generateOtp");
const { hashOtp, verifyOtpHash } = require("../utils/otpSecurity");
const { sendVerificationEmail } = require("../services/emailService");


const {
  uploadFile,
  deleteFile
} = require("../services/storage.service");
const registerRecruiter = async (req, res) => {
  try {
    const {
      fullName,
      userId,
      email,
      designation,
      password,
      companyName
    } = req.body;

    // Validate required fields
    if (
      !fullName?.trim() ||
      !userId?.trim() ||
      !email?.trim() ||
      !designation?.trim() ||
      !companyName?.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required and password must be at least 8 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUserId = userId.trim();

    // Check whether recruiter email or user ID exists
    const existingRecruiter = await recruiterSchema.findOne({
      $or: [
        { email: normalizedEmail },
        { userId: normalizedUserId }
      ]
    });

    if (existingRecruiter) {
      return res.status(409).json({
        success: false,
        message: "Email or User ID already registered"
      });
    }

    // Check whether email verification is already pending
    const existingPending = await PendingRegistration.findOne({
      email: normalizedEmail,
      role: "recruiter"
    });

    if (existingPending) {
      return res.status(409).json({
        success: false,
        message: "Verification already pending. Please verify your email."
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate and hash OTP
    const otp = generateOtp();
    const otpHash = hashOtp(otp, normalizedEmail, "recruiter");

    const now = Date.now();

    const otpExpiresAt = new Date(now + 5 * 60 * 1000);
    const registrationExpiresAt = new Date(now + 30 * 60 * 1000);

    // Store temporary registration
    const pending = await PendingRegistration.create({
      role: "recruiter",
      email: normalizedEmail,

      registrationData: {
        fullName: fullName.trim(),
        userId: normalizedUserId,
        email: normalizedEmail,
        designation: designation.trim(),
        companyName: companyName.trim(),
        password: hashedPassword
      },

      otpHash,
      otpExpiresAt,
      registrationExpiresAt,
      attempts: 0,
      emailSent: false,
      lastSentAt: new Date(now),
      verificationStatus: "pending",
      verificationLockedAt: null
    });

    // Send OTP through Nodemailer
    try {
      await sendVerificationEmail(normalizedEmail, otp);

      await PendingRegistration.updateOne(
        { _id: pending._id },
        { $set: { emailSent: true } }
      );
    } catch (emailError) {
      await PendingRegistration.deleteOne({
        _id: pending._id
      });

      console.error("Recruiter OTP email error:", emailError);

      return res.status(502).json({
        success: false,
        message: "Unable to send verification email. Please try again."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification OTP sent to your email",
      email: normalizedEmail,
      requiresVerification: true
    });

  } catch (error) {
    console.error("Recruiter registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or User ID already exists, or verification is pending"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Recruiter registration failed"
    });
  }
};



const verifyRecruiterEmail = async (req, res) => {
  let lockedPendingId = null;

  try {
    const { email, otp } = req.body;

    // Validate input
    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid email and 6-digit OTP are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find pending recruiter registration
    const pending = await PendingRegistration.findOne({
      email: normalizedEmail,
      role: "recruiter"
    }).select("+otpHash +registrationData");

    if (!pending) {
      return res.status(404).json({
        success: false,
        message: "No pending recruiter registration found"
      });
    }

    const now = new Date();

    // Check registration expiry
    if (pending.registrationExpiresAt <= now) {
      return res.status(410).json({
        success: false,
        message: "Registration expired. Please register again."
      });
    }

    // Check OTP expiry
    if (pending.otpExpiresAt <= now) {
      return res.status(410).json({
        success: false,
        message: "OTP expired. Please request a new OTP."
      });
    }

    if (!pending.emailSent) {
      return res.status(400).json({
        success: false,
        message: "OTP email is not ready. Please try again."
      });
    }

    if (pending.verificationStatus !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Verification is already being processed"
      });
    }

    if (pending.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Request a new OTP."
      });
    }

    // Compare entered OTP with stored hash
    const isValidOtp = verifyOtpHash(
      otp,
      normalizedEmail,
      "recruiter",
      pending.otpHash
    );

    if (!isValidOtp) {
      await PendingRegistration.updateOne(
        {
          _id: pending._id,
          otpHash: pending.otpHash,
          verificationStatus: "pending",
          attempts: { $lt: 5 }
        },
        {
          $inc: { attempts: 1 }
        }
      );

      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // Lock this registration to prevent duplicate verification
    const lockedPending =
      await PendingRegistration.findOneAndUpdate(
        {
          _id: pending._id,
          otpHash: pending.otpHash,
          verificationStatus: "pending",
          attempts: { $lt: 5 },
          otpExpiresAt: { $gt: new Date() },
          registrationExpiresAt: { $gt: new Date() },
          emailSent: true
        },
        {
          $set: {
            verificationStatus: "processing",
            verificationLockedAt: new Date()
          }
        },
        {
          returnDocument: "after"
        }
      ).select("+registrationData");

    if (!lockedPending) {
      return res.status(409).json({
        success: false,
        message: "Verification could not be completed. Please try again."
      });
    }

    lockedPendingId = lockedPending._id;

    const recruiterData = lockedPending.registrationData;

    // Recheck unique email and user ID before account creation
    const existingRecruiter = await recruiterSchema.findOne({
      $or: [
        { email: normalizedEmail },
        { userId: recruiterData.userId }
      ]
    });

    if (existingRecruiter) {
      await PendingRegistration.deleteOne({
        _id: lockedPendingId
      });

      lockedPendingId = null;

      return res.status(409).json({
        success: false,
        message: "Recruiter email or User ID already registered"
      });
    }

    // Create recruiter using the previously hashed password
    const recruiter = await recruiterSchema.create({
      fullName: recruiterData.fullName,
      userId: recruiterData.userId,
      email: normalizedEmail,
      designation: recruiterData.designation,
      companyName: recruiterData.companyName,
      password: recruiterData.password,

      // Recruiter must complete profile before requesting approval
      isProfileCompleted: false,
      approvalStatus: "not_requested",
      approvalRequestedAt: null
    });

    // Remove temporary registration
    await PendingRegistration.deleteOne({
      _id: lockedPendingId
    });

    lockedPendingId = null;

    return res.status(201).json({
      success: true,
      message: "Email verified. Recruiter registered successfully",
      recruiter: {
        id: recruiter._id,
        fullName: recruiter.fullName,
        userId: recruiter.userId,
        email: recruiter.email,
        designation: recruiter.designation,
        companyName: recruiter.companyName,
        isProfileCompleted: recruiter.isProfileCompleted,
        approvalStatus: recruiter.approvalStatus
      }
    });

  } catch (error) {
    console.error("Recruiter verification error:", error);

    // Release lock if verification failed before account creation
    if (lockedPendingId) {
      await PendingRegistration.updateOne(
        {
          _id: lockedPendingId,
          verificationStatus: "processing"
        },
        {
          $set: {
            verificationStatus: "pending",
            verificationLockedAt: null
          }
        }
      ).catch(console.error);
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Recruiter email or User ID already registered"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Recruiter email verification failed"
    });
  }
};

const resendRecruiterOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const pending = await PendingRegistration.findOne({
      email: normalizedEmail,
      role: "recruiter"
    });

    if (!pending) {
      return res.status(404).json({
        success: false,
        message: "No pending recruiter registration found"
      });
    }

    const now = Date.now();

    if (pending.registrationExpiresAt.getTime() <= now) {
      return res.status(410).json({
        success: false,
        message: "Registration expired. Please register again."
      });
    }

    if (pending.verificationStatus !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Verification is already being processed"
      });
    }

    const secondsSinceLastSent = Math.floor(
      (now - new Date(pending.lastSentAt).getTime()) / 1000
    );

    if (secondsSinceLastSent < 60) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting another OTP",
        retryAfterSeconds: 60 - secondsSinceLastSent
      });
    }

    const otp = generateOtp();

    const otpHash = hashOtp(
      otp,
      normalizedEmail,
      "recruiter"
    );

    const updatedPending =
      await PendingRegistration.findOneAndUpdate(
        {
          _id: pending._id,
          role: "recruiter",
          verificationStatus: "pending",
          registrationExpiresAt: { $gt: new Date(now) },
          lastSentAt: {
            $lte: new Date(now - 60 * 1000)
          }
        },
        {
          $set: {
            otpHash,
            otpExpiresAt: new Date(now + 5 * 60 * 1000),
            attempts: 0,
            emailSent: false,
            lastSentAt: new Date(now)
          }
        },
        {
          returnDocument: "after"
        }
      );

    if (!updatedPending) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting another OTP"
      });
    }

    try {
      await sendVerificationEmail(normalizedEmail, otp);

      await PendingRegistration.updateOne(
        {
          _id: updatedPending._id,
          otpHash
        },
        {
          $set: { emailSent: true }
        }
      );

    } catch (emailError) {
      console.error("Recruiter resend OTP error:", emailError);

      return res.status(502).json({
        success: false,
        message: "Unable to resend OTP. Please try again later."
      });
    }

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully"
    });

  } catch (error) {
    console.error("Resend recruiter OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP"
    });
  }
};

// Recruiter Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find recruiter
    const recruiter = await recruiterSchema.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!recruiter) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      recruiter.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }
    // Check if admin has deleted the recruiter account
    if (recruiter.isDeleted === true) {
      return res.status(403).json({
        success: false,
        isDeleted: true,
        message:
          "Your account no longer exists. Please contact the Admin or Director, MAIMT."
      });
    }




    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: recruiter._id.toString(),
        role: "recruiter"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );
    console.log(token)
    // Successful login
    return res.status(200).json({
      message: "Recruiter login successful",
      token,
      recruiter: {
        id: recruiter._id,
        fullName: recruiter.fullName,
        email: recruiter.email,
        companyName: recruiter.companyName,
        designation: recruiter.designation
      }
    });

  } catch (err) {
    console.error("Recruiter login error:", err);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};


const getCompanyProfile = async (req, res) => {
  try {
    const recruiter = await recruiterSchema
      .findById(req.recruiter._id)
      .select("-password");

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found"
      });
    }

    return res.status(200).json({
      success: true,
      recruiter
    });

  } catch (error) {
    console.error("Get company profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch company profile"
    });
  }
};


// Update logged-in recruiter's company profile
const updateCompanyProfile = async (req, res) => {
  try {
    const allowedFields = [
      "companyName",
      "designation",
      "industry",
      "companyWebsite",
      "companyLocation",
      "companySize",
      "foundedYear",
      "companyDescription",
      "companyLinkedin",
      "companyPhone"
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const recruiter = await recruiterSchema.findByIdAndUpdate(
      req.recruiter._id,
      { $set: updates },
      {
        returnDocument: "after",
        runValidators: true
      }
    ).select("-password");

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
      recruiter
    });

  } catch (error) {
    console.error("Update company profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update company profile"
    });
  }
};


const uploadCompanyLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a company logo"
      });
    }

    const recruiter = await recruiterSchema.findById(
      req.recruiter._id
    );

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found"
      });
    }

    // Multer must use memoryStorage()
    if (!req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Image buffer not found"
      });
    }

    // Validate the uploaded image
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only JPG, PNG and WebP allowed"
      });
    }

    const oldFileId = recruiter.companyLogoFileId;

    // Upload to ImageKit
    const result = await uploadFile(
      req.file.buffer,
      req.file.originalname
    );

    // Save latest image details
    recruiter.companyLogo = result.url;
    recruiter.companyLogoFileId = result.fileId;

    try {
      await recruiter.save();
    } catch (saveError) {
      await deleteFile(result.fileId).catch(console.error);
      throw saveError;
    }

    // Remove previous ImageKit logo
    if (oldFileId) {
      try {
        await deleteFile(oldFileId);
      } catch (error) {
        console.error("Old logo cleanup failed:", error);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Company logo uploaded successfully",
      companyLogo: recruiter.companyLogo
    });

  } catch (error) {
    console.error("Company logo upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload company logo"
    });
  }
};


const uploadCompanyBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a company banner"
      });
    }

    if (!req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Banner image buffer not found"
      });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only JPG, PNG and WEBP images are allowed"
      });
    }

    const recruiter = await recruiterSchema.findById(
      req.recruiter._id
    );

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found"
      });
    }

    const oldFileId = recruiter.companyBannerFileId;

    // Upload banner to ImageKit
    const result = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      "/company-banners"
    );

    // Save ImageKit URL and file ID in MongoDB
    recruiter.companyBanner = result.url;
    recruiter.companyBannerFileId = result.fileId;

    try {
      await recruiter.save();
    } catch (saveError) {
      // Remove newly uploaded image if database save fails
      await deleteFile(result.fileId).catch(console.error);
      throw saveError;
    }

    // Delete previous banner after successful database save
    if (oldFileId && oldFileId !== result.fileId) {
      try {
        await deleteFile(oldFileId);
      } catch (error) {
        console.error("Old banner cleanup failed:", error);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Company banner uploaded successfully",
      companyBanner: recruiter.companyBanner
    });

  } catch (error) {
    console.error("Company banner upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload company banner"
    });
  }
};

const submitRecruiterApproval = async (req, res) => {
  try {
    const recruiter = await recruiterSchema.findById(
      req.recruiter._id
    ).select("-password");

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found"
      });
    }

    if (recruiter.approvalStatus !== "not_requested") {
      return res.status(409).json({
        success: false,
        message: "Your approval request has already been submitted or reviewed"
      });
    }

    // Required company profile fields
    const requiredFields = [
      "companyName",
      "designation",
      "industry",
      "companyWebsite",
      "companyLocation",
      "companySize",
      "companyDescription",
      "companyPhone",
      "companyLogo",
      "companyBanner"
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = recruiter[field];

      return (
        value === undefined ||
        value === null ||
        (typeof value === "string" && !value.trim())
      );
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please complete your company profile before submitting",
        missingFields
      });
    }

    // Atomically submit approval request
    const updatedRecruiter =
      await recruiterSchema.findOneAndUpdate(
        {
          _id: recruiter._id,
          approvalStatus: "not_requested",
          isDeleted: { $ne: true }
        },
        {
          $set: {
            isProfileCompleted: true,
            approvalStatus: "pending",
            approvalRequestedAt: new Date()
          }
        },
        {
          returnDocument: "after",
          runValidators: true
        }
      ).select("-password");

    if (!updatedRecruiter) {
      return res.status(409).json({
        success: false,
        message: "Approval request could not be submitted"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company profile submitted for Admin approval",
      recruiter: updatedRecruiter
    });

  } catch (error) {
    console.error("Submit recruiter approval error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit approval request"
    });
  }
};


module.exports = {
  registerRecruiter,
  login,
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo,
  uploadCompanyBanner,
  verifyRecruiterEmail,
  resendRecruiterOtp,
  submitRecruiterApproval
};