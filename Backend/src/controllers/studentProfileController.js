const Student = require("../models/studentsPostData.Model");

const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    student: req.student
  });
};

const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "fullName",
      "phone",
      "linkedin",
      "github",
      "address",
      "course",
      "college",
      "startYear",
      "endYear",
      "cgpa",
      "about",
      "skills"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (
        Object.prototype.hasOwnProperty.call(
          req.body,
          field
        )
      ) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid profile fields provided"
      });
    }

    if (
      updates.fullName !== undefined &&
      (
        typeof updates.fullName !== "string" ||
        !updates.fullName.trim()
      )
    ) {
      return res.status(400).json({
        message: "Full name cannot be empty"
      });
    }

    const student = await Student.findById(
      req.student._id
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    Object.assign(student, updates);

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      student: student.toObject({
        transform: (doc, ret) => {
          delete ret.password;
          return ret;
        }
      })
    });

  } catch (error) {
    if (error.name === "ValidationError" ||
      error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid profile data"
      });
    }

    console.error("Profile update error:", error);

    return res.status(500).json({
      message: "Unable to update profile"
    });
  }
};

module.exports = {
  getProfile,
  updateProfile
};