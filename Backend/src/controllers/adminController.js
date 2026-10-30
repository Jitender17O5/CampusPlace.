const mongoose = require("mongoose");
const Admin = require("../models/adminModel");
const Recruiter = require("../models/recruiterModel");
const {
  sendRecruiterApprovedEmail,
  sendRecruiterRejectedEmail
} = require("../services/emailService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= ADMIN LOGIN =================

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find admin and include password
    const admin = await Admin.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        adminId: admin._id,
        role: "admin"
      },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1d"
      }
    );
    console.log(token)

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Admin login failed"
    });
  }
};


// ================= ADMIN DASHBOARD STATS =================

exports.getAdminDashboardStats = async (req, res) => {
  try {
    const Student = require("../models/studentsPostData.Model");
    const Recruiter = require("../models/recruiterModel");
    const Job = require("../models/jobModel");
    const Application = require("../models/applicationModel");

    const [
      totalStudents,
      totalRecruiters,
      totalJobs,
      totalApplications
    ] = await Promise.all([
      Student.countDocuments({
        isDeleted: { $ne: true }
      }),
      Recruiter.countDocuments({
        isDeleted: { $ne: true }
      }),
      Job.countDocuments(),
      Application.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalRecruiters,
        totalJobs,
        totalApplications
      }
    });

  } catch (error) {
    console.error("Admin dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics"
    });
  }
};

// ================= GET ALL STUDENTS =================

exports.getAllStudents = async (req, res) => {
  try {
    const Student = require("../models/studentsPostData.Model");

    const students = await Student.find({
      isDeleted: { $ne: true }
    })
      .select(
        "fullName collegeEmail rollNo phone course college " +
        "startYear endYear cgpa about skills address " +
        "linkedin github resumeUrl createdAt"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      students
    });

  } catch (error) {
    console.error("Get all students error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students"
    });
  }
};


// ================= SOFT DELETE STUDENT =================

exports.deleteStudent = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const Student = require("../models/studentsPostData.Model");

    const { studentId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID"
      });
    }

    // Atomically mark an active student as deleted
    const student = await Student.findOneAndUpdate(
      {
        _id: studentId,
        isDeleted: { $ne: true }
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date()
        }
      },
      {
        new: true,
        runValidators: true
      }
    ).select("_id fullName collegeEmail isDeleted deletedAt");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found or already deleted"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student account deleted successfully",
      student: {
        id: student._id,
        fullName: student.fullName,
        isDeleted: student.isDeleted,
        deletedAt: student.deletedAt
      }
    });

  } catch (error) {
    console.error("Soft delete student error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete student account"
    });
  }
};


// ================= GET ALL RECRUITERS =================

exports.getAllRecruiters = async (req, res) => {
  try {
    const Recruiter = require("../models/recruiterModel");

    // Fetch only active recruiters
    const recruiters = await Recruiter.find({
      isDeleted: { $ne: true }
    })
      .select(
        "fullName userId email companyName designation " +
        "companyLogo companyBanner industry companyWebsite " +
        "companyLocation companySize foundedYear " +
        "companyDescription companyLinkedin companyPhone " +
        "approvalStatus createdAt"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: recruiters.length,
      recruiters
    });

  } catch (error) {
    console.error("Get all recruiters error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch recruiters"
    });
  }
};

// ================= SOFT DELETE RECRUITER =================

exports.deleteRecruiter = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const Recruiter = require("../models/recruiterModel");

    const { recruiterId } = req.params;

    // Validate recruiter ID
    if (!mongoose.isValidObjectId(recruiterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recruiter ID"
      });
    }

    // Soft delete only active recruiter accounts
    const recruiter = await Recruiter.findOneAndUpdate(
      {
        _id: recruiterId,
        isDeleted: { $ne: true }
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date()
        }
      },
      {
        new: true,
        runValidators: true
      }
    ).select(
      "_id fullName email companyName isDeleted deletedAt"
    );

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found or already deleted"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recruiter account deleted successfully",
      recruiter: {
        id: recruiter._id,
        fullName: recruiter.fullName,
        companyName: recruiter.companyName,
        isDeleted: recruiter.isDeleted,
        deletedAt: recruiter.deletedAt
      }
    });

  } catch (error) {
    console.error("Soft delete recruiter error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete recruiter account"
    });
  }
};


// ========== GET RECRUITER APPROVAL REQUESTS ==========

exports.getRecruiterRequests = async (req, res) => {
  try {
    const recruiters = await Recruiter.find({
      isDeleted: { $ne: true },
      approvalStatus: "pending",
      isProfileCompleted: true,
      approvalRequestedAt: { $ne: null }
    })
      .select(
        "fullName userId email companyName designation " +
        "companyLogo companyBanner industry companyWebsite " +
        "companyLocation companySize foundedYear " +
        "companyDescription companyLinkedin companyPhone " +
        "isProfileCompleted approvalStatus approvalRequestedAt createdAt"
      )
      .sort({ approvalRequestedAt: -1 });

    return res.status(200).json({
      success: true,
      count: recruiters.length,
      recruiters
    });

  } catch (error) {
    console.error("Get recruiter requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch recruiter requests"
    });
  }
};

// ========== APPROVE OR REJECT RECRUITER ==========

exports.updateRecruiterApproval = async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const { approvalStatus } = req.body;

    if (!mongoose.isValidObjectId(recruiterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recruiter ID"
      });
    }

    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid approval status"
      });
    }

    // Only pending recruiters can be reviewed
    const recruiter = await Recruiter.findOneAndUpdate(
      {
        _id: recruiterId,
        isDeleted: { $ne: true },
        approvalStatus: "pending",
        isProfileCompleted: true,
        approvalRequestedAt: { $ne: null }
      },
      {
        $set: {
          approvalStatus
        }
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    ).select(
      "_id fullName email companyName approvalStatus"
    );

    if (!recruiter) {
      return res.status(409).json({
        success: false,
        message: "Recruiter not found, deleted, or already reviewed"
      });
    }

    // Send email after saving the approval decision
    let emailSent = false;

    try {
      if (approvalStatus === "approved") {
        await sendRecruiterApprovedEmail(recruiter);
      } else {
        await sendRecruiterRejectedEmail(recruiter);
      }

      emailSent = true;
      // console.log(first)

    } catch (emailError) {
      console.error(
        "Recruiter approval notification error:",
        emailError
      );
    }

    return res.status(200).json({
      success: true,
      message:
        approvalStatus === "approved"
          ? "Recruiter approved successfully"
          : "Recruiter rejected successfully",
      emailSent,
      recruiter
    });

  } catch (error) {
    console.error("Update recruiter approval error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update recruiter approval"
    });
  }
};
