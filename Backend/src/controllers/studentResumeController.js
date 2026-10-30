const Student = require("../models/studentsPostData.Model");

const {
  uploadFile,
  deleteFile
} = require("../services/storage.service");

const uploadStudentResume = async (req, res) => {
  let newFileId = null;

  try {
    // Check uploaded file
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a PDF resume"
      });
    }

    // Verify PDF file signature
    if (
      req.file.buffer.length < 5 ||
      req.file.buffer.subarray(0, 5).toString() !== "%PDF-"
    ) {
      return res.status(400).json({
        message: "Invalid PDF file"
      });
    }

    // Get authenticated student
    const student = await Student.findById(req.student._id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Keep previous resume ID
    const oldFileId = student.resumeFileId;

    // Upload new resume to ImageKit
    const result = await uploadFile(
      req.file.buffer,
      `resume-${student._id}-${Date.now()}.pdf`,
      "/student-resumes"
    );

    newFileId = result.fileId;

    // Update student record
    student.resumeUrl = result.url;
    student.resumeFileId = result.fileId;

    await student.save();

    // Delete previous resume after successful update
    if (oldFileId && oldFileId !== newFileId) {
      try {
        await deleteFile(oldFileId);
      } catch (deleteError) {
        console.error(
          "Old resume cleanup failed:",
          deleteError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl: student.resumeUrl,
      resumeFileId: student.resumeFileId
    });

  } catch (error) {
    // Remove newly uploaded file if database update fails
    if (newFileId) {
      try {
        await deleteFile(newFileId);
      } catch (cleanupError) {
        console.error("Resume cleanup failed:", cleanupError);
      }
    }

    console.error("Resume upload error:", error);

    return res.status(500).json({
      message: "Failed to upload resume"
    });
  }
};

// Get current student's resume
const getStudentResume = async (req, res) => {
  try {
    const student = await Student.findById(req.student._id)
      .select("resumeUrl");

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    return res.status(200).json({
      success: true,
      resumeUrl: student.resumeUrl || ""
    });

  } catch (error) {
    console.error("Get resume error:", error);

    return res.status(500).json({
      message: "Failed to fetch resume"
    });
  }
};

module.exports = {
  uploadStudentResume,
  getStudentResume
};