
const express = require("express");

const {
  adminLogin,
  getAdminDashboardStats,
  getAllStudents,
  deleteStudent,
  getAllRecruiters,
  deleteRecruiter,
  getRecruiterRequests,
  updateRecruiterApproval
} = require("../controllers/adminController");

const adminAuthMiddleware = require(
  "../middlewares/adminAuthMiddleware"
);

const {
  getAllContactMessages,
  markContactMessageRead
} = require("../controllers/contactController");

const router = express.Router();

// Public Admin login route
router.post("/login", adminLogin);
router.get("/profile", adminAuthMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    admin: {
      id: req.admin._id,
      email: req.admin.email,
      role: req.admin.role
    }
  });
});

// Protected Admin Dashboard Statistics
router.get(
  "/dashboard/stats",
  adminAuthMiddleware,
  getAdminDashboardStats
);
// ================= MANAGE STUDENTS =================

router.get(
  "/students",
  adminAuthMiddleware,
  getAllStudents
);

//delete students 
// ================= SOFT DELETE STUDENT =================

router.delete(
  "/students/:studentId",
  adminAuthMiddleware,
  deleteStudent
);

// ================= GET ALL RECRUITERS =================

router.get(
  "/recruiters",
  adminAuthMiddleware,
  getAllRecruiters
  
);
// ================= DELETE RECRUITER =================

router.delete(
  "/recruiters/:recruiterId",
  adminAuthMiddleware,
  deleteRecruiter
);

// ================= RECRUITER APPROVAL REQUESTS =================

// Get recruiter registration requests
router.get(
  "/recruiter-requests",
  adminAuthMiddleware,
  getRecruiterRequests
);

// Approve or reject recruiter registration
router.patch(
  "/recruiter-requests/:recruiterId",
  adminAuthMiddleware,
  updateRecruiterApproval
);



 // ================= CONTACT MESSAGES =================

// Get all messages
router.get(
  "/contact-messages",
  adminAuthMiddleware,
  getAllContactMessages
);

// Mark a message as read
router.patch(
  "/contact-messages/:messageId/read",
  adminAuthMiddleware,
  markContactMessageRead
);

module.exports = router;
