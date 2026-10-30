
import { Route, Routes, useLocation } from "react-router-dom";

import { Nave } from "./components/navbar";
import { Home } from "./pages/homePage";
import { RoleSelection } from "./pages/RoleSelection/RoleSeclection";
import { Login } from "./pages/Login";

import { StudentSignUp } from "./pages/SignUp/studentSignup";
import { StudentVerifyEmail } from "./pages/SignUp/StudentVerifyEmail";

import { RecruiterSignUp } from "./pages/SignUp/recruiterSignup";
import { RecruiterDashboard } from "./pages/Recruiter/RecruiterDashboard";
import { PostJob } from "./pages/Recruiter/PostJob";
import { ManageJobs } from "./pages/Recruiter/ManageJobs";
import { Applicants } from "./pages/Recruiter/Applicants";
import { CompanyProfile } from "./pages/Recruiter/CompanyProfile";

import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { ProtectedRoute } from "./components/dashboard/protectedRoutes";

import { About } from "./pages/About";
import { Footer } from "./pages/footer";
import { Contact } from "./pages/Contact";

import { Jobs } from "./pages/Jobs";
import { JobDetails } from "./pages/Jobs/JobDetails";

import { ToastContainer } from "react-toastify";


import { StudentDashboard } from "./pages/Student/studentDashboard";
import { StudentProfile } from "./pages/Student/studentProfile";
// import StudentP  
import { EditProfile } from "./pages/Student/editProfile";
// import { StudentJobs } from "./pages/Student/Jobs";
import { StudentJobs } from "./pages/Student/StudentJobs";
import { Application } from "./pages/Student/Applications";

// import admin
import { AdminDashboard } from "./pages/Admin/AdminDashboard";
import { ManageStudents } from "./pages/Admin/ManageStudents";
import { ManageRecruiters } from "./pages/Admin/ManageRecruiters";
import { AdminApplications } from "./pages/Admin/Applications";
import { AdminContactMessages } from "./pages/Admin/AdminContactMessages";

import { ForgotPassword } from "./pages/Password/ForgotPassword";
import { VerifyResetOtp } from "./pages/Password/VerifyResetOtp";
import { ResetPassword } from "./pages/Password/ResetPassword";

import { ScrollToTop } from "./components/ScrollToTop";

function App() {
  const location = useLocation();

  // Hide public Navbar and Footer on all dashboard routes
  const dashboardPaths = [
    "/studentDashboard",
    "/recruiterDashboard",
    "/adminDashboard",
  ];

  const isDashboard = dashboardPaths.some(
    (path) =>
      location.pathname === path ||
      location.pathname.startsWith(path + "/")
  );

  return (
    <main
      style={{
        overflowX: "hidden",
        backgroundColor: "#eaedff",
      }}
    >
      <ScrollToTop />
      <ToastContainer />

      {!isDashboard && <Nave />}

      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}

        <Route path="/" element={<Home />} />
        <Route path="/roleSelection" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route
          path="/forgot"
          element={<ForgotPassword />}
        />
        <Route
          path="/forgot/verify-otp"
          element={<VerifyResetOtp />}
        />
        <Route
          path="/forgot/reset"
          element={<ResetPassword />}
        />

        {/* Student Signup */}
        <Route
          path="/studentSignup"
          element={<StudentSignUp />}
        />

        {/* Student OTP Verification */}
        <Route
          path="/student/verify-email"
          element={<StudentVerifyEmail />}
        />

        {/* Recruiter Signup */}
        <Route
          path="/recruiterSignup"
          element={<RecruiterSignUp />}
        />

        {/* Recruiter OTP Verification — Reuse same component */}
        <Route
          path="/recruiter/verify-email"
          element={<StudentVerifyEmail />}
        />

        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/jobs" element={<Jobs />} />




        {/* ========== STUDENT PROTECTED ROUTES ========== */}

        <Route element={<ProtectedRoute role="student" />}>
          <Route
            path="/studentDashboard"
            element={<DashboardLayout role="student" />}
          >
            {/* Student Dashboard Home */}
            <Route index element={<StudentDashboard />} />

            {/* All Available Jobs */}
            <Route path="jobs" element={<StudentJobs />} />

            {/* View Job Details */}
            <Route path="jobs/:id" element={<JobDetails />} />

            {/* Applied Jobs */}
            <Route path="applications" element={<Application />} />

            {/* Student Profile */}
            <Route path="profile" element={<StudentProfile />} />
            <Route path="profile/edit" element={<EditProfile />} />
          </Route>
        </Route>


        {/* ========== RECRUITER PROTECTED ROUTES ========== */}

        <Route element={<ProtectedRoute role="recruiter" />}>
          <Route
            path="/recruiterDashboard"
            element={<DashboardLayout role="recruiter" />}
          >
            <Route index element={<RecruiterDashboard />} />

            {/* Add PostJob here when ready */}
            <Route path="post-job" element={<PostJob />} />
            {/* <Route path="post-job" element={<PostJob />} /> */}
            <Route path="manage-jobs" element={<ManageJobs />} />
            <Route path="applicants" element={<Applicants />} />
            <Route path="company-profile" element={<CompanyProfile />} />
          </Route>
        </Route>


        {/* ========== ADMIN DASHBOARD ========== */}
        <Route path="/admin/login" element={<Login />} />
        {/* Add admin nested routes after creating pages */}
        {/* ========== ADMIN LOGIN ========== */}

        {/* ========== ADMIN DASHBOARD ========== */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route
            path="/adminDashboard"
            element={<DashboardLayout role="admin" />}
          >
            <Route index element={<AdminDashboard />} />
            <Route
              path="students"
              element={<ManageStudents />}
            />

            <Route path="recruiters" element={<ManageRecruiters />} />
            <Route
              path="applications"
              element={<AdminApplications />}
            />
            {/* New Contact Messages Page */}
            <Route
              path="contact-messages"
              element={<AdminContactMessages />}
            />
          </Route>
        </Route>

        {/* ========== NOT FOUND ========== */}

        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>

      {!isDashboard && <Footer />}
    </main>
  );
}

export default App;
