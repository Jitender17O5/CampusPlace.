import { useState } from "react";
import {
  Container,
  Button,
  Form,
  Spinner,
  Alert
} from "react-bootstrap";

import { GiGraduateCap } from "react-icons/gi";
import {
  IoEyeOutline,
  IoEyeOffOutline
} from "react-icons/io5";

import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams
} from "react-router-dom";

import { toast } from "react-toastify";
import { resetPassword } from "../../Api/postApi";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const role = searchParams.get("role")?.toLowerCase();

  const email = location.state?.email;
  const resetToken = location.state?.resetToken;

  const validRoles = ["student", "recruiter", "admin"];

  const isValidSession =
    validRoles.includes(role) &&
    typeof email === "string" &&
    typeof resetToken === "string" &&
    resetToken.length > 0;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidSession) {
      toast.error("Invalid reset session. Please request a new OTP.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must contain at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Both passwords must match");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({
        email,
        role,
        resetToken,
        newPassword,
        confirmPassword
      });

      toast.success(
        response.data.message || "Password reset successfully"
      );

      // Clear any old login token for the role.
      if (role === "student") {
        sessionStorage.removeItem("studentToken");
      } else if (role === "recruiter") {
        sessionStorage.removeItem("recruiterToken");
      } else if (role === "admin") {
        sessionStorage.removeItem("adminToken");
      }

      // Redirect to the correct login page.
      if (role === "admin") {
        navigate("/admin/login", {
          replace: true
        });
      } else {
        navigate("/login", {
          replace: true,
          state: {
            role:
              role.charAt(0).toUpperCase() +
              role.slice(1)
          }
        });
      }

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to reset password"
      );
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
        className="p-4 rounded-4 shadow bg-white"
        style={{
          width: "100%",
          maxWidth: "450px",
          border: "1px solid #e5e7eb"
        }}
      >
        <div className="text-center mb-4">
          <GiGraduateCap size={65} className="mb-2" />

          <h2 className="fw-bold mb-2">
            Reset Password
          </h2>

          <p className="text-muted">
            Create a new password for your account.
          </p>

          {email && (
            <p className="fw-semibold mb-0">
              {email}
            </p>
          )}
        </div>

        {!isValidSession ? (
          <Alert variant="warning">
            Your password reset session is missing or invalid.
            Please request a new OTP.

            <div className="mt-3">
              <Link
                to={
                  validRoles.includes(role)
                    ? `/forgot?role=${role}`
                    : "/roleSelection"
                }
              >
                Back to Forgot Password
              </Link>
            </div>
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>

            {/* New Password */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                New Password
              </Form.Label>

              <div className="position-relative">
                <Form.Control
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  className="py-2 pe-5"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
                />

                <span
                  onClick={() =>
                    setShowNewPassword(!showNewPassword)
                  }
                  className="position-absolute top-50 end-0 translate-middle-y me-3"
                  style={{
                    cursor: "pointer",
                    fontSize: "21px"
                  }}
                >
                  {showNewPassword ? (
                    <IoEyeOffOutline />
                  ) : (
                    <IoEyeOutline />
                  )}
                </span>
              </div>

              <Form.Text className="text-muted">
                Password must be at least 8 characters.
              </Form.Text>
            </Form.Group>

            {/* Confirm Password */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                Confirm New Password
              </Form.Label>

              <div className="position-relative">
                <Form.Control
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  className="py-2 pe-5"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
                />

                <span
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="position-absolute top-50 end-0 translate-middle-y me-3"
                  style={{
                    cursor: "pointer",
                    fontSize: "21px"
                  }}
                >
                  {showConfirmPassword ? (
                    <IoEyeOffOutline />
                  ) : (
                    <IoEyeOutline />
                  )}
                </span>
              </div>
            </Form.Group>

            <Button
              type="submit"
              className="w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>

            <div className="text-center mt-4">
              <Link
                to={`/forgot?role=${role}`}
                className="text-decoration-none fw-semibold"
              >
                ← Start Again
              </Link>
            </div>
          </Form>
        )}
      </div>
    </Container>
  );
};