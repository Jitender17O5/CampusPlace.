const PendingRegistration = require(
  "../models/pendingRegistrationModel"
);

const generateOtp = require("../utils/generateOtp");


const {
  hashOtp,
  verifyOtpHash
} = require("../utils/otpSecurity");

const {
  sendVerificationEmail
} = require("../services/emailService");

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const REGISTRATION_EXPIRY_MS = 30 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;


const bcrypt = require("bcrypt");
const Student = require("../models/studentsPostData.Model");
const generateToken = require("../utils/generateTokens");

// Register student
const registerStudent = async (req, res) => {
  try {
    const {
      fullName,
      collegeEmail,
      rollNo,
      password
    } = req.body;

    if (
      typeof fullName !== "string" ||
      !fullName.trim() ||
      typeof collegeEmail !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(collegeEmail.trim()) ||
      typeof rollNo !== "string" ||
      !rollNo.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: "Provide valid registration details"
      });
    }

    const email = collegeEmail.trim().toLowerCase();
    const normalizedRollNo = rollNo.trim();

    // Check existing registered email
    const existingEmail = await Student.findOne({
      collegeEmail: email
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // Check existing registered roll number
    const existingRollNo = await Student.findOne({
      rollNo: normalizedRollNo
    });

    if (existingRollNo) {
      return res.status(409).json({
        message: "Roll number already registered"
      });
    }

    // Prevent duplicate pending registrations
    const pending = await PendingRegistration.findOne({
      email,
      role: "student"
    });

    if (pending) {
      return res.status(409).json({
        message: "Verification already pending. Please verify your email."
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = generateOtp();

    // Securely hash OTP
    const otpHash = hashOtp(
      otp,
      email,
      "student"
    );

    // OTP expires after 5 minutes
    const now = Date.now();

    const otpExpiresAt = new Date(
      now + OTP_EXPIRY_MS
    );

    const registrationExpiresAt = new Date(
      now + REGISTRATION_EXPIRY_MS
    );

    // Store pending registration
    const pendingRegistration = await PendingRegistration.create({
      role: "student",
      email,
      registrationData: {
        fullName: fullName.trim(),
        collegeEmail: email,
        rollNo: normalizedRollNo,
        password: hashedPassword
      },
      otpHash,
      otpExpiresAt,
      registrationExpiresAt,
      attempts: 0,
      lastSentAt: new Date(),
      emailSent: false,
      verificationStatus: "pending",
      verificationLockedAt: null
    });

    try {
      // Send OTP email
      await sendVerificationEmail(email, otp);

      await PendingRegistration.updateOne(
        { _id: pendingRegistration._id },
        { $set: { emailSent: true } }
      );
    } catch (emailError) {
      await PendingRegistration.deleteOne({
        _id: pendingRegistration._id,
        emailSent: false
      });

      console.error("OTP email error:", emailError);

      return res.status(503).json({
        message: "Unable to send verification email. Please try again."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification OTP sent to your email",
      email,
      requiresVerification: true
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Registration already exists or is pending"
      });
    }

    console.error("Student registration error:", error);

    return res.status(500).json({
      message: "Registration failed"
    });
  }
};
//verifyStudent Email
const verifyStudentEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        message: "Valid email and six-digit OTP are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const pending = await PendingRegistration.findOne({
      email: normalizedEmail,
      role: "student"
    }).select("+otpHash +registrationData");

    if (!pending) {
      return res.status(400).json({
        message: "No pending registration found"
      });
    }

    const now = new Date();

    if (
      !pending.otpExpiresAt ||
      !pending.registrationExpiresAt ||
      pending.otpExpiresAt <= now ||
      pending.registrationExpiresAt <= now
    ) {
      return res.status(400).json({
        message: "OTP or registration expired"
      });
    }

    if (!pending.emailSent) {
      return res.status(400).json({
        message: "Verification email is not ready"
      });
    }

    if (pending.verificationStatus !== "pending") {
      return res.status(409).json({
        message: "Verification is already being processed"
      });
    }

    if (pending.attempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({
        message: "Maximum OTP attempts exceeded"
      });
    }

    const isValid = verifyOtpHash(
      otp,
      normalizedEmail,
      "student",
      pending.otpHash
    );

    if (!isValid) {
      const attempt = await PendingRegistration.updateOne(
        {
          _id: pending._id,
          otpHash: pending.otpHash,
          verificationStatus: "pending",
          attempts: { $lt: MAX_OTP_ATTEMPTS },
          otpExpiresAt: { $gt: new Date() },
          registrationExpiresAt: { $gt: new Date() }
        },
        {
          $inc: { attempts: 1 }
        }
      );

      if (attempt.modifiedCount !== 1) {
        return res.status(409).json({
          message: "OTP changed, expired, or attempt limit reached"
        });
      }

      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    // Atomically lock this OTP against concurrent verification
    const locked = await PendingRegistration.findOneAndUpdate(
      {
        _id: pending._id,
        otpHash: pending.otpHash,
        verificationStatus: "pending",
        attempts: { $lt: MAX_OTP_ATTEMPTS },
        emailSent: true,
        otpExpiresAt: { $gt: new Date() },
        registrationExpiresAt: { $gt: new Date() }
      },
      {
        $set: {
          verificationStatus: "processing",
          verificationLockedAt: new Date()
        }
      },
      { new: true }
    );

    if (!locked) {
      return res.status(409).json({
        message: "OTP expired or verification already processing"
      });
    }

    try {
      const data = pending.registrationData;

      const student = await Student.create({
        fullName: data.fullName,
        collegeEmail: data.collegeEmail,
        rollNo: data.rollNo,
        password: data.password
      });

      // Student created successfully; remove pending record
      await PendingRegistration.deleteOne({
        _id: pending._id
      });

      return res.status(201).json({
        success: true,
        message: "Email verified. Student registered successfully",
        student: {
          id: student._id,
          fullName: student.fullName,
          collegeEmail: student.collegeEmail,
          rollNo: student.rollNo
        }
      });
    } catch (creationError) {
      // Do not release the lock if account creation succeeded.
      // A retry must not create another account.
      const existingStudent = await Student.findOne({
        collegeEmail: normalizedEmail
      });

      if (!existingStudent) {
        await PendingRegistration.updateOne(
          {
            _id: pending._id,
            verificationStatus: "processing"
          },
          {
            $set: {
              verificationStatus: "pending",
              verificationLockedAt: null
            }
          }
        );
      }

      throw creationError;
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email or roll number already registered"
      });
    }

    console.error("Verification error:", error);

    return res.status(500).json({
      message: "Email verification failed"
    });
  }
};
const resendStudentOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        message: "Valid email is required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date();

    const pending = await PendingRegistration.findOne({
      email: normalizedEmail,
      role: "student"
    });

    if (!pending) {
      return res.status(404).json({
        message: "No pending registration found. Please register again."
      });
    }

    if (pending.registrationExpiresAt <= now) {
      return res.status(410).json({
        message: "Registration expired. Please register again."
      });
    }

    if (pending.verificationStatus !== "pending") {
      return res.status(409).json({
        message: "Verification is already processing"
      });
    }

    const elapsed =
      now.getTime() - pending.lastSentAt.getTime();

    if (elapsed < RESEND_COOLDOWN_MS) {
      return res.status(429).json({
        message: "Please wait before requesting another OTP",
        retryAfterSeconds: Math.ceil(
          (RESEND_COOLDOWN_MS - elapsed) / 1000
        )
      });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(
      otp,
      normalizedEmail,
      "student"
    );

    const updated = await PendingRegistration.findOneAndUpdate(
      {
        _id: pending._id,
        verificationStatus: "pending",
        lastSentAt: {
          $lte: new Date(now.getTime() - RESEND_COOLDOWN_MS)
        },
        registrationExpiresAt: { $gt: now }
      },
      {
        $set: {
          otpHash,
          otpExpiresAt: new Date(
            now.getTime() + OTP_EXPIRY_MS
          ),
          attempts: 0,
          emailSent: false,
          lastSentAt: now
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(429).json({
        message: "Please try resending OTP later"
      });
    }

    try {
      await sendVerificationEmail(normalizedEmail, otp);

      await PendingRegistration.updateOne(
        { _id: updated._id, otpHash },
        { $set: { emailSent: true } }
      );

      return res.status(200).json({
        success: true,
        message: "New OTP sent successfully"
      });
    } catch (emailError) {
      console.error("Resend email error:", emailError);

      return res.status(503).json({
        message: "Unable to resend OTP"
      });
    }

  } catch (error) {
    console.error("Resend OTP error:", error);

    return res.status(500).json({
      message: "OTP resend failed"
    });
  }
};
// Login student
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const student = await Student.findOne({
  collegeEmail: email.trim().toLowerCase()
}).select("+password");
    // Check if the student account has been deleted
    if (student?.isDeleted === true) {
      return res.status(403).json({
        success: false,
        isDeleted: true,
        message:
          "Your account no longer exists. Please contact the Admin or Director, MAIMT."
      });
    }

    if (!student) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      student.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = generateToken(student._id);

    return res.status(200).json({
      success: true,
      message: "Student login successful",
      token,
      student: {
        id: student._id,
        fullName: student.fullName,
        collegeEmail: student.collegeEmail,
        rollNo: student.rollNo
      }
    });


  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed"
    });
  }
};

module.exports = {
  registerStudent,
  verifyStudentEmail, resendStudentOtp,
  login
};