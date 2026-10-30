const jwt = require("jsonwebtoken");
const Student = require("../models/studentsPostData.Model");

const studentAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !/^Bearer \S+$/.test(authHeader)
    ) {
      return res.status(401).json({
        message: "Authentication token required"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        algorithms: ["HS256"]
      }
    );

    if (
      decoded.role !== "student" ||
      !decoded.studentId
    ) {
      return res.status(403).json({
        message: "Student access required"
      });
    }

    const student = await Student.findOne({
      _id: decoded.studentId,
      isDeleted: { $ne: true }
    }).select("-password");

    if (!student) {
      return res.status(401).json({
        message: "Student account no longer exists"
      });
    }

    req.student = student;

    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please login again"
      });
    }

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError" ||
      error.name === "CastError"
    ) {
      return res.status(401).json({
        message: "Invalid authentication token"
      });
    }

    console.error("Authentication error:", error);

    return res.status(500).json({
      message: "Authentication failed"
    });
  }
};

module.exports = studentAuth;