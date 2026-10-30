
const jwt = require("jsonwebtoken");
const Recruiter = require("../models/recruiterModel");

const recruiterAuthMiddleware = async (req, res, next) => {
  try {
    // 1. Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. Token is missing.",
      });
    }

    // 2. Extract JWT
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid authorization header.",
      });
    }

    // 3. Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    // 4. Check recruiter role
    if (decoded.role !== "recruiter" || !decoded.id) {
      return res.status(403).json({
        message: "Only recruiters can access this resource.",
      });
    }

    // 5. Find recruiter in MongoDB
    const recruiter = await Recruiter.findById(decoded.id)
      .select("-password");

    if (!recruiter) {
      return res.status(401).json({
        message: "Recruiter account not found.",
      });
    }
    // Block deleted recruiter accounts
    if (recruiter.isDeleted === true) {
      return res.status(403).json({
        success: false,
        isDeleted: true,
        message:
          "Your account no longer exists. Please contact the Admin or Director, MAIMT."
      });
    }

    // ========== CHECK ADMIN APPROVAL ==========

    if (recruiter.approvalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        approvalStatus: recruiter.approvalStatus || "pending",
        message:
          recruiter.approvalStatus === "rejected"
            ? "Your registration request has been rejected by the Admin."
            : "Your account is pending Admin approval. Please wait until your registration is approved."
      });
    }


    // 6. Attach recruiter to request
    req.recruiter = recruiter;

    // 7. Continue to controller
    next();

  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token. Please login again.",
      });
    }

    console.error("Recruiter authentication error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

module.exports = recruiterAuthMiddleware;
