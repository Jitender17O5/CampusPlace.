
import { IoNotificationsOutline } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import "./topbar.css";

export const Topbar = ({ role }) => {
  const location = useLocation();

  // ================= PAGE TITLES =================

  const pageTitles = {
    student: {
      "/studentDashboard": "Dashboard",
      "/studentDashboard/jobs": "Jobs",
      "/studentDashboard/applications": "My Applications",
      "/studentDashboard/profile": "My Profile",
      "/studentDashboard/profile/edit": "Edit Profile",
    },

    recruiter: {
      "/recruiterDashboard": "Dashboard",
      "/recruiterDashboard/post-job": "Post Job",
      "/recruiterDashboard/manage-jobs": "Manage Jobs",
      "/recruiterDashboard/applicants": "Applicants",
      "/recruiterDashboard/company-profile": "Company Profile",
    },

    admin: {
      "/adminDashboard": "Admin Dashboard",
      "/adminDashboard/students": "Manage Students",
      "/adminDashboard/recruiters": "Manage Recruiters",
      "/adminDashboard/jobs": "Manage Jobs",
      "/adminDashboard/applications": "Applications",
      "/adminDashboard/profile": "Admin Profile",
    },
  };

  // ================= DYNAMIC PAGE TITLE =================

  const getPageTitle = () => {
    const path = location.pathname;

    return pageTitles[role]?.[path] || "Dashboard";
  };

  return (
    <div className="campus-topbar d-flex align-items-center justify-content-between p-3">

      {/* LEFT SECTION */}
      <div>
        <h5 className="m-0 fw-bold topbar-title">
          {getPageTitle()}
        </h5>
      </div>

      {/* RIGHT SECTION */}
      <div className="d-flex align-items-center gap-4">

        {/* Notification Icon */}
        <div className="notification-wrapper">
          <IoNotificationsOutline
            size={25}
            className="notification-icon"
          />

          {/* Notification Count */}
          <span className="notification-badge">
            3
          </span>
        </div>

      </div>
    </div>
  );
};
