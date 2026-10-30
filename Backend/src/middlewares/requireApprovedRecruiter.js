const requireApprovedRecruiter = (req, res, next) => {
  if (!req.recruiter) {
    return res.status(401).json({
      success: false,
      message: "Recruiter authentication required"
    });
  }

  if (
    req.recruiter.approvalStatus !== "approved"
  ) {
    return res.status(403).json({
      success: false,
      approvalStatus: req.recruiter.approvalStatus,
      message:
        "Your account must be approved by the Admin before posting jobs."
    });
  }

  next();
};

module.exports = requireApprovedRecruiter;