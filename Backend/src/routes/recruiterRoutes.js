
const express = require("express");

const {
  registerRecruiter,
  login,
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo,
  uploadCompanyBanner,
  verifyRecruiterEmail,
  resendRecruiterOtp,
  submitRecruiterApproval
} = require("../controllers/recruiterControllers");

const companyLogoUpload = require(
  "../middlewares/companyLogoUpload"
);

const companyBannerUpload = require(
  "../middlewares/companyBannerUpload"
);

const recruiterAuthMiddleware = require(
  "../middlewares/recruiterAuthMiddleware"
);

const route = express.Router();

// Public routes
route.post("/register", registerRecruiter);


route.post("/verify-email", verifyRecruiterEmail);
route.post("/resend-otp", resendRecruiterOtp);
route.post("/login", login);

// Protected company profile routes
route.get(
  "/company-profile",
  recruiterAuthMiddleware,
  getCompanyProfile
);

// Submit completed company profile for admin approval
route.patch(
  "/company-profile/submit-approval",
  recruiterAuthMiddleware,
  submitRecruiterApproval
);

route.patch(
  "/company-profile",
  recruiterAuthMiddleware,
  updateCompanyProfile
);

// Company logo upload
route.patch(
  "/company-profile/logo",
  recruiterAuthMiddleware,
  companyLogoUpload.single("companyLogo"),
  uploadCompanyLogo
);

// Company banner upload
route.patch(
  "/company-profile/banner",
  recruiterAuthMiddleware,
  companyBannerUpload.single("companyBanner"),
  uploadCompanyBanner
);

module.exports = route;
