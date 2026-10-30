import { useState } from "react";
import { Container, Button } from "react-bootstrap";
// import { form } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { GiGraduateCap } from "react-icons/gi";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
// import { StudentVerifyEmail } from "./StudentVerifyEmail";

import { registerStudent } from "../../Api/postApi";

import { toast } from "react-toastify";

export const StudentSignUp = () => {
  // const [fullName,setFullname]=useState("")
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const role = location.state?.role || "Student";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (data.password.length < 8) {
      toast.error("Password must contain at least 8 characters");
      return;
    }

    const { confirmPassword, ...studentData } = data;

    try {
      setLoading(true);

      const response = await registerStudent(studentData);
      console.log("Registration status:", response.status);
      console.log("Registration response:", response.data);

      if (response.data.requiresVerification) {
        toast.success(
          response.data.message || "OTP sent to your email"
        );

        // Navigate to OTP verification page
        navigate("/student/verify-email", {
          state: {
            email: response.data.email || studentData.collegeEmail,
            role: "Student"
          }
        });

        return;
      }

      toast.error("Unexpected registration response");

    } catch (err) {
      console.error("Registration error:", err.response?.data);

      toast.error(
        err.response?.data?.message ||
        "Unable to register student"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center py-5"
      style={{ minHeight: "85vh" }}
    >
      <div
        className="p-4 rounded-4 shadow"
        style={{
          width: "100%",
          maxWidth: "600px",
          border: "1px solid #e5e7eb",
          backgroundColor: "#fff",
        }}
      >
        {/* Heading */}
        <div className="text-center mb-4">
          <GiGraduateCap
            size={60}
            className="mb-2"
            style={{ color: "#5316f9" }}
          />

          <h2 className="fw-bold mb-1">
            Create {role} Account
          </h2>

          <p className="text-muted mb-0">
            Create your account to get started
          </p>
        </div>

        <Form onSubmit={handleSubmit}>

          {/* Full Name */}
          <div className="mb-2">
            <label
              htmlFor="fullName"
              className="form-label fw-semibold"
            >
              Full Name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              className="form-control py-2"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* College Email */}
          <div className="mb-2">
            <label
              htmlFor="collegeEmail"
              className="form-label fw-semibold"
            >
              College Email
            </label>

            <input
              id="email"
              name="collegeEmail"
              type="email"
              className="form-control py-2"
              placeholder="Enter your college email"
              required
            />
          </div>

          {/* Roll Number */}
          <div className="mb-2">
            <label
              htmlFor="rollNo"
              className="form-label fw-semibold"
            >
              Roll Number
            </label>

            <input
              id="rollNo"
              name="rollNo"
              type="text"
              className="form-control py-2"
              placeholder="Enter your roll number"
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
                  fontSize: "21px",
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

          {/* Confirm Password */}
          <div className="mb-3">
            <label
              htmlFor="confirmPassword"
              className="form-label fw-semibold"
            >
              Confirm Password
            </label>

            <div className="position-relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="form-control py-2 pe-5"
                placeholder="Confirm your password"
                required
              />

              <span
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                style={{
                  cursor: "pointer",
                  fontSize: "21px",
                }}
              >
                {showConfirmPassword ? (
                  <IoEyeOffOutline />
                ) : (
                  <IoEyeOutline />
                )}
              </span>
            </div>
          </div>

          {/* Create Account */}
          <Button
            type="submit"
            disabled={loading}
            className="w-100 py-2 fw-semibold border-0"
            style={{ backgroundColor: "#5316f9" }}
          >
            {loading ? "Sending OTP..." : "Create Account"}
          </Button>
        </Form>

        {/* OR */}
        <div className="d-flex align-items-center gap-3 my-2">
          <div
            className="flex-grow-1"
            style={{ borderTop: "1px solid #d1d5db" }}
          />

          <span className="text-muted">OR</span>

          <div
            className="flex-grow-1"
            style={{ borderTop: "1px solid #d1d5db" }}
          />
        </div>

        {/* Login */}
        <p className="text-center mb-2">
          Already have an account?{" "}
          <Link
            to="/login"
            state={{ role }}
            className="text-decoration-none fw-semibold"
            style={{ color: "#5316f9" }}
          >
            Login
          </Link>
        </p>

        {/* Back */}
      {/* Back to Role Selection */}
<Button
  variant="outline-secondary"
  className="w-100 py-2 fw-semibold"
  onClick={() => navigate("/roleSelection")}
>
  ← Back to Role Selection
</Button>
      </div>
    </Container>
  );
};