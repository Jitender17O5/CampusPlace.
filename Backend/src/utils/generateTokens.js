const jwt = require("jsonwebtoken");

const generateToken = (studentId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      studentId: studentId.toString(),
      role: "student"
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      algorithm: "HS256"
    }
  );
};

module.exports = generateToken;