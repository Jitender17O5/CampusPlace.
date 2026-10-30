

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// Automatically attach JWT based on API endpoint



api.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    const studentToken = sessionStorage.getItem("studentToken");
    const recruiterToken = sessionStorage.getItem("recruiterToken");
    const adminToken = sessionStorage.getItem("adminToken");

    // ================= STUDENT ROUTES =================

    const isStudentApplicationRequest =
      url === "/api/applications" ||
      (
        url.startsWith("/api/applications/") &&
        !url.startsWith("/api/applications/job/") &&
        !url.startsWith("/api/applications/recruiter/")
      );

    if (
      (url.startsWith("/student/") ||
        isStudentApplicationRequest) &&
      studentToken
    ) {
      config.headers.Authorization = `Bearer ${studentToken}`;
    }

    // ================= RECRUITER ROUTES =================

    const isRecruiterApplicationRequest =
      url.startsWith("/api/applications/job/") ||
      url.startsWith("/api/applications/recruiter/");

    if (
      (
        url.startsWith("/recruiter/") ||
        isRecruiterApplicationRequest
      ) &&
      recruiterToken
    ) {
      config.headers.Authorization = `Bearer ${recruiterToken}`;
    }

    // ================= RECRUITER JOB MANAGEMENT =================

    const isRecruiterJobRequest =
      url === "/api/jobs/my-jobs" ||
      (
        (
          url === "/api/jobs" ||
          url.startsWith("/api/jobs/")
        ) &&
        ["post", "patch", "put", "delete"].includes(
          config.method?.toLowerCase()
        )
      );

    if (isRecruiterJobRequest && recruiterToken) {
      config.headers.Authorization = `Bearer ${recruiterToken}`;
    }

    // ================= ADMIN ROUTES =================

if (
  url.startsWith("/admin/") &&
  url !== "/admin/login" &&
  adminToken
) {
  config.headers.Authorization = `Bearer ${adminToken}`;
}

  
    return config;
  },
  (error) => Promise.reject(error)
);



// ============ STUDENT API ============

export const registerStudent = (data) => {
  return api.post("/student/register", data);
};

export const studentLogin = (data) => {
  return api.post("/student/login", data);
};

export const getStudentProfile = () => {
  return api.get("/student/profile");
};

export const updateStudentProfile = (data) => {
  return api.patch("/student/profile", data);
};

// ============ RECRUITER API ============

export const registerRecruiter = (data) => {
  return api.post("/recruiter/register", data);
};

export const recruiterLogin = (data) => {
  return api.post("/recruiter/login", data);
};

// ============ JOB API ============

export const postNewJob = (data) => {
  return api.post("/api/jobs", data);
};


// Fetch all active jobs from MongoDB
export const getAllJobs = () => {
  return api.get("/api/jobs");
};
//see jobs
export const getJobById = (id) => {
  return api.get(`/api/jobs/${id}`);
};


// ============ APPLICATION API ============

// Student applies for a job
export const applyForJob = (jobId) => {
  return api.post(`/api/applications/${jobId}`);
};

// Fetch logged-in student's applications
export const getMyApplications = () => {
  return api.get("/api/applications");
};

// Fetch applicants for jobs posted by the logged-in recruiter
export const getRecruiterApplicants = () => {
  return api.get("/api/applications/recruiter/all");
};

//get all jobs


export const getRecruiterJobs = () => {
  return api.get("/api/jobs/my-jobs");
};

export const updateRecruiterJob = (jobId, data) => {
  return api.put(`/api/jobs/${jobId}`, data);
};

export const deleteRecruiterJob = (jobId) => {
  return api.delete(`/api/jobs/${jobId}`);
};


// Fetch logged-in recruiter's company profile
export const getCompanyProfile = () => {
  return api.get("/recruiter/company-profile");
};

// Update logged-in recruiter's company profile
export const updateCompanyProfile = (data) => {
  return api.patch("/recruiter/company-profile", data);
};


export const uploadCompanyLogo = (formData) => {
  return api.patch("/recruiter/company-profile/logo", formData);
};

export const uploadCompanyBanner = (formData) => {
  return api.patch(
    "/recruiter/company-profile/banner",
    formData
  );
};

export const verifyStudentEmail = (data) => {
  return api.post("/student/verify-email", data);
};

export const resendStudentOtp = (data) => {
  return api.post("/student/resend-otp", data);
};



export const verifyRecruiterEmail = (data) => {
  return api.post("/recruiter/verify-email", data);
};

export const resendRecruiterOtp = (data) => {
  return api.post("/recruiter/resend-otp", data);
};


export const getStudentResume = () => {
  return api.get("/student/resume");
};

export const uploadStudentResume = (formData) => {
  return api.patch("/student/resume", formData);
};


// ============ ADMIN API ============

// Admin login
export const adminLogin = (data) => {
  return api.post("/admin/login", data);
};

// ================= ADMIN DASHBOARD =================

export const getAdminDashboardStats = () => {
  return api.get("/admin/dashboard/stats");
};

// ================= ADMIN STUDENTS =================

export const getAllAdminStudents = () => {
  return api.get("/admin/students");
};

// ================= ADMIN DELETE STUDENT =================

export const deleteAdminStudent = (studentId) => {
  return api.delete(`/admin/students/${studentId}`);
};
// ================= GET ALL ADMIN RECRUITERS =================

export const getAllAdminRecruiters = () => {
  return api.get("/admin/recruiters");
};

// ================= ADMIN DELETE RECRUITER =================

export const deleteAdminRecruiter = (recruiterId) => {
  return api.delete(`/admin/recruiters/${recruiterId}`);
};

// ========== ADMIN RECRUITER APPROVAL ==========

// Get all recruiter registration requests
export const getAdminRecruiterRequests = () => {
  return api.get("/admin/recruiter-requests");
};

// Approve or reject recruiter registration
export const updateAdminRecruiterApproval = (
  recruiterId,
  approvalStatus
) => {
  return api.patch(
    `/admin/recruiter-requests/${recruiterId}`,
    { approvalStatus }
  );
};

export const submitRecruiterApproval = () => {
  return api.patch(
    "/recruiter/company-profile/submit-approval"
  );
};

export const submitContactMessage = (data) => {
  return api.post("/api/contact", data);
};

// Get all contact messages
export const getAdminContactMessages = () => {
  return api.get("/admin/contact-messages");
};

// Mark contact message as read
export const markAdminContactMessageRead = (messageId) => {
  return api.patch(`/admin/contact-messages/${messageId}/read`);
};



// ============ FORGOT PASSWORD API ============

// Step 1: Send password reset OTP
export const forgotPassword = (data) => {
  return api.post("/api/password/forgot", data);
};

// Step 2: Verify password reset OTP
export const verifyPasswordResetOtp = (data) => {
  return api.post("/api/password/verify-otp", data);
};

// Step 3: Reset password
export const resetPassword = (data) => {
  return api.post("/api/password/reset", data);
};
export default api;
