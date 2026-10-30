import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import { MdDashboard } from "react-icons/md";
import {
  FaBriefcase,
  FaUser,
  FaBuilding,
  FaUsers,
  FaUserGraduate
} from "react-icons/fa";
import { MdOutlineContactMail } from "react-icons/md";

import { FiLogOut } from "react-icons/fi";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoMdAddCircleOutline } from "react-icons/io";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

import "./sideBar.css";

export const DashboardSidebar = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ================= STUDENT MENUS =================

  const studentMenus = [
    {
      name: "Dashboard",
      path: "/studentDashboard",
      icon: <MdDashboard />,
      end: true
    },
    {
      name: "Jobs",
      path: "/studentDashboard/jobs",
      icon: <FaBriefcase />
    },
    {
      name: "Applications",
      path: "/studentDashboard/applications",
      icon: <IoDocumentTextOutline />
    },

    {
      name: "Profile",
      path: "/studentDashboard/profile",
      icon: <FaUser />
    }
  ];

  // ================= RECRUITER MENUS =================

  const recruiterMenus = [
    {
      name: "Dashboard",
      path: "/recruiterDashboard",
      icon: <MdDashboard />,
      end: true
    },
    {
      name: "Post Job",
      path: "/recruiterDashboard/post-job",
      icon: <IoMdAddCircleOutline />
    },
    {
      name: "Manage Jobs",
      path: "/recruiterDashboard/manage-jobs",
      icon: <FaBriefcase />
    },
    {
      name: "Applicants",
      path: "/recruiterDashboard/applicants",
      icon: <FaUsers />
    },
    {
      name: "Company Profile",
      path: "/recruiterDashboard/company-profile",
      icon: <FaBuilding />
    }
  ];

  // ================= ADMIN MENUS =================

  const adminMenus = [
    {
      name: "Dashboard",
      path: "/adminDashboard",
      icon: <MdDashboard />,
      end: true
    },
    {
      name: "Manage Students",
      path: "/adminDashboard/students",
      icon: <FaUserGraduate />
    },
    {
      name: "Manage Recruiters",
      path: "/adminDashboard/recruiters",
      icon: <FaBuilding />
    },

    {
      name: "Applications",
      path: "/adminDashboard/applications",
      icon: <IoDocumentTextOutline />
    },
    {
      name: "Contact Messages",
      path: "/adminDashboard/contact-messages",
      icon: <MdOutlineContactMail />
    },

  ];

  // ================= ROLE-BASED MENU =================

  const menuConfig = {
    student: studentMenus,
    recruiter: recruiterMenus,
    admin: adminMenus
  };

  const menus = menuConfig[role] || [];



  // ================= LOGOUT =================

  const handleLogout = () => {
    if (role === "student") {
      sessionStorage.removeItem("studentToken");
    }

    if (role === "recruiter") {
      sessionStorage.removeItem("recruiterToken");
    }

    // Admin logout
    if (role === "admin") {
      sessionStorage.removeItem("adminToken");
    }

    toast.success("Logged out successfully");

    navigate("/", { replace: true });
  };


  // ================= ACTIVE MENU =================

  const isActive = (path, end = false) => {
    if (end) {
      return location.pathname === path;
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(path + "/")
    );
  };

  return (
    <Sidebar
      width="260px"
      backgroundColor="#e9edff"
      className="campus-sidebar"
      style={{
        height: "100vh",
        borderRight: "1px solid #dce3f5"
      }}
    >
      <div className="d-flex flex-column h-100">

        {/* Logo */}
        <div className="p-4">
          <h3 className="fw-bold mb-0">
            CampusPlace
          </h3>
        </div>

        {/* Dynamic Navigation */}
        <Menu
          menuItemStyles={{
            button: ({ active }) => ({
              backgroundColor: active
                ? "#dbe7ff"
                : "transparent",

              color: active ? "#0d6efd" : "#1f2937",

              borderLeft: active
                ? "4px solid #0d6efd"
                : "4px solid transparent",

              borderRadius: "8px",
              margin: "5px 12px",
              width: "calc(100% - 24px)",
              paddingLeft: "16px",
              transition: "all 0.25s ease",

              "&:hover": {
                backgroundColor: "#dbe7ff",
                color: "#0d6efd",
                transform: "translateX(4px)"
              }
            }),

            icon: ({ active }) => ({
              color: active ? "#0d6efd" : "#374151",
              transition: "color 0.25s ease"
            })
          }}
        >
          {menus.map((item) => (
            <MenuItem
              key={item.path}
              active={isActive(item.path, item.end)}
              icon={item.icon}
              component={
                <NavLink
                  to={item.path}
                  end={item.end || false}
                />
              }
            >
              {item.name}
            </MenuItem>
          ))}
        </Menu>

        {/* Logout at Bottom */}
        <div className="mt-auto p-3">
          <Button
            variant="outline-danger"
            className="w-100 logout-btn"
            onClick={handleLogout}
          >
            <FiLogOut className="me-2" />
            Logout
          </Button>
        </div>

      </div>
    </Sidebar>
  );
};