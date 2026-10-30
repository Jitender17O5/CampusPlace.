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
  Link,
  useLocation,
  useNavigate,
  useSearchParams
} from "react-router-dom";

import { toast } from "react-toastify";

import {
  verifyPasswordResetOtp
} from "../../Api/postApi";

export const VerifyResetOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const role = searchParams.get("role")?.toLowerCase();
  const email = location.state?.email;

  const validRoles = ["student", "recruiter", "admin"];
  const isValidRole = validRoles.includes(role);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidRole || !email) {
      toast.error("Invalid reset session. Please request a new OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyPasswordResetOtp({
        email,
        role,
        otp
      });

      const resetToken = response.data.resetToken;

      if (!resetToken) {
        toast.error("Reset token missing from server response");
        return;
      }

      toast.success("OTP verified successfully");

      // Pass the token to the next page.
      // Do not include the reset token in the URL.
      navigate(`/forgot/reset?role=${role}`, {
        replace: true,
        state: {
          email,
          resetToken
        }
      });

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "OTP verification failed"
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
            Verify OTP
          </h2>

          <p className="text-muted mb-2">
            Enter the six-digit verification code sent to your email.
          </p>

          {email && (
            <p className="fw-semibold mb-0">
              {email}
            </p>
          )}
        </div>

        {!isValidRole || !email ? (
          <Alert variant="warning">
            Your password reset session is missing or invalid.
            Please return to Forgot Password and request a new OTP.

            <div className="mt-3">
              <Link
                to={
                  isValidRole
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
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                Verification Code
              </Form.Label>

              <Form.Control
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setOtp(value);
                }}
                className="py-2 text-center fs-5"
                required
                disabled={loading}
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100 py-2 fw-semibold"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <div className="text-center mt-4">
              <Link
                to={`/forgot?role=${role}`}
                className="text-decoration-none fw-semibold"
              >
                ← Request a New OTP
              </Link>
            </div>
          </Form>
        )}
      </div>
    </Container>
  );
};