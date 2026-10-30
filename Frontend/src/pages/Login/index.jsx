
import { useState } from "react";
import { Container, Button, Form } from "react-bootstrap";
import { GiGraduateCap } from "react-icons/gi";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import {
  studentLogin,
  recruiterLogin,
  adminLogin
} from "../../Api/postApi";

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Admin can also log in directly through /admin/login.
  const role =
    location.pathname === "/admin/login"
      ? "Admin"
      : location.state?.role;


  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!["Student", "Recruiter", "Admin"].includes(role)) {
      toast.error("Please select a valid role");
      return;
    }

    setLoading(true);

    try {
      let response;

      // ================= STUDENT LOGIN =================
      if (role === "Student") {
        response = await studentLogin(data);
      }

      // ================= RECRUITER LOGIN =================
      else if (role === "Recruiter") {
        response = await recruiterLogin(data);
      }

      // ================= ADMIN LOGIN =================
      else if (role === "Admin") {
        response = await adminLogin(data);
      }

      // ================= STUDENT RESPONSE =================
      if (role === "Student") {
        const token = response.data.token;

        if (!token) {
          toast.error("Student login response is missing JWT");
          return;
        }

        sessionStorage.setItem("studentToken", token);

        toast.success("Student login successful");

        navigate("/studentDashboard", {
          replace: true
        });
      }

      // ================= RECRUITER RESPONSE =================
      else if (role === "Recruiter") {
        const token = response.data.token;

        if (!token) {
          toast.error("Recruiter login response is missing JWT");
          return;
        }

        sessionStorage.setItem("recruiterToken", token);

        toast.success("Recruiter login successful");

        navigate("/recruiterDashboard", {
          replace: true
        });
      }

      // ================= ADMIN RESPONSE =================
      else if (role === "Admin") {
        const token = response.data.token;

        if (!token) {
          toast.error("Admin login response is missing JWT");
          return;
        }

        sessionStorage.setItem("adminToken", token);

        toast.success("Admin login successful");

        navigate("/adminDashboard", {
          replace: true
        });
      }

    } catch (error) {
      const data = error.response?.data;

      if (data?.isDeleted === true) {
        toast.error(data.message, {
          autoClose: 6000
        });
        return;
      }

      toast.error(data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center mt-3 mb-3"
      style={{ minHeight: "85vh" }}
    >
      <div
        className="p-4 rounded-4 shadow"
        style={{
          width: "100%",
          maxWidth: "450px",
          border: "1px solid #e5e7eb"
        }}
      >
        {/* Heading */}
        <div className="text-center mb-4">
          <GiGraduateCap size={65} className="mb-2" />

          <h2 className="fw-bold mb-1">{role} Login</h2>
          <p className="text-muted mb-0">Login to continue</p>
        </div>

        <Form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label
              htmlFor="email"
              className="form-label fw-semibold"
            >
              Email Address {role}
            </label>

            <input
              id="email"
              name="email"
              type="email"
              className="form-control py-2"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label
              htmlFor="password"
              className="form-label fw-semibold"
            >
              Password
            </label>

            <div className="position-relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="form-control py-2 pe-5"
                placeholder="Enter your password"
                required
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                style={{
                  cursor: "pointer",
                  fontSize: "21px"
                }}
              >
                {showPassword ? (
                  <IoEyeOffOutline />
                ) : (
                  <IoEyeOutline />
                )}
              </span>
            </div>
          </div>
          {/* Forgot Password - Student and Recruiter only */}

          <div className="d-flex justify-content-end mb-4">
            <Link
              to={`/forgot?role=${role?.toLowerCase() || ""}`}
              className="text-decoration-none"
            >
              Forgot Password?
            </Link>
          </div>

    

          {/* Login Button */}
          <Button
            type="submit"
            className="w-100 py-2 fw-semibold"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Form>
        <div className="d-flex align-items-center gap-3 my-4">
          <div
            className="flex-grow-1"
            style={{ borderTop: "1px solid #d1d5db" }}
          ></div>

          <span className="text-muted">OR</span>

          <div
            className="flex-grow-1"
            style={{ borderTop: "1px solid #d1d5db" }}
          ></div>
        </div>
        {/* Signup - Student and Recruiter only */}
        {role !== "Admin" && (
          <>


            <p className="text-center mb-3">
              Don't have an account?{" "}
              <Link
                to={
                  role === "Student"
                    ? "/studentSignup"
                    : "/recruiterSignup"
                }
                className="text-decoration-none fw-semibold"
              >
                Sign up
              </Link>
            </p>
          </>
        )}

        {/* Existing back navigation */}
        <Button
          variant="outline-secondary"
          className="w-100 py-2 fw-semibold"
          onClick={() => {
            if (role === "Admin") {
              navigate("/");
            } else {
              navigate("/roleSelection", {
                state: { action: "login" }
              });
            }
          }}
        >
          {role === "Admin"
            ? "← Back to Home"
            : "← Back to Role Selection"}
        </Button>
      </div>
    </Container>
  );
};
