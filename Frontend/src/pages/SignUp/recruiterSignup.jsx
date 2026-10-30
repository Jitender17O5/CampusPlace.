import { useState } from "react";
import { Container, Button } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { GiGraduateCap } from "react-icons/gi";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerRecruiter } from "../../Api/postApi";

export const RecruiterSignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const role = location.state?.role || "Recruiter";
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (data.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    const { confirmPassword, ...recruiterData } = data;
    const normalizedEmail = recruiterData.email.trim().toLowerCase();

    try {
      setLoading(true);

      const response = await registerRecruiter(recruiterData);

      if (response.data.requiresVerification) {
        toast.success(
          response.data.message || "OTP sent to your email"
        );

        navigate("/recruiter/verify-email", {
          state: {
            email: response.data.email || normalizedEmail,
            role: "Recruiter"
          }
        });

        return;
      }

      toast.error("Unexpected registration response");

    } catch (err) {
      const message = err.response?.data?.message || "";

      console.error("Recruiter registration error:", err.response?.data || err);

      // Handle a registration that already has an OTP pending
      if (
        err.response?.status === 409 &&
        message.toLowerCase().includes("verification already pending")
      ) {
        toast.info("Registration already pending. Please verify your email.");

        navigate("/recruiter/verify-email", {
          state: {
            email: response.data.email,
            role: "Recruiter"
          }
        });

        return;
      }

      toast.error(message || "Unable to register recruiter");

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
          <div className="mb-3">
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

          {/* UserId */}
          <div className="mb-3">
            <label
              htmlFor="userID"
              className="form-label fw-semibold"
            >
              UserId
            </label>

            <input
              id="userID"
              name="userId"
              type="text"
              className="form-control py-2"
              placeholder="Enter your UserId"
              required
            />
          </div>

          {/*  Email */}
          <div className="mb-3">
            <label
              htmlFor="email"
              className="form-label fw-semibold"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              className="form-control py-2"
              placeholder="Enter your  email"
              required
            />
          </div>

          {/* Designation */}
          <div className="mb-3">
            <label
              htmlFor="designation"
              className="form-label fw-semibold"
            >
              Designation
            </label>

            <input
              id="designation"
              name="designation"
              type="text"
              className="form-control py-2"
              placeholder="Enter your Designation"
              required
            />
          </div>

          {/* Company Name */}
          <div className="mb-3">
            <label
              htmlFor="companyName"
              className="form-label fw-semibold"
            >
              Company Name
            </label>

            <input
              id="companyName"
              name="companyName"
              type="text"
              className="form-control py-2"
              placeholder="Enter your company name"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3">
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
          <div className="mb-4">
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
        <div className="d-flex align-items-center gap-3 my-4">
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
        <p className="text-center mb-3">
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
        <Button
          variant="outline-secondary"
          className="w-100 py-2 fw-semibold"
          onClick={() => navigate(-1)}
        >
          ← Back to Role Selection
        </Button>
      </div>
    </Container>
  );
};