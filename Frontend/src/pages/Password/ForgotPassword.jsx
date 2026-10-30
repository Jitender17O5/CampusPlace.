import { useState } from "react";
import {
  Container,
  Button,
  Form,
  Spinner
} from "react-bootstrap";

import { GiGraduateCap } from "react-icons/gi";
import {
  Link,
  useNavigate,
  useSearchParams
} from "react-router-dom";

import { toast } from "react-toastify";
import { forgotPassword } from "../../Api/postApi";

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const role = searchParams.get("role")?.toLowerCase();

  const validRoles = ["student", "recruiter", "admin"];
  const isValidRole = validRoles.includes(role);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidRole) {
      toast.error("Invalid account role. Please return to login.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Please enter your registered email");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword({
        email: normalizedEmail,
        role
      });

      toast.success(response.data.message);

      navigate(
        `/forgot/verify-otp?role=${role}`,
        {
          state: {
            email: normalizedEmail
          }
        }
      );

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to process password reset request"
      );
    } finally {
      setLoading(false);
    }
  };

  const loginPath =
    role === "admin" ? "/admin/login" : "/login";

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
            Forgot Password?
          </h2>

          <p className="text-muted">
            Enter your registered email address to receive
            a password reset OTP.
          </p>

          {isValidRole && (
            <span className="badge bg-primary">
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          )}
        </div>

        {!isValidRole ? (
          <div className="text-center">
            <p className="text-danger">
              Invalid or missing account role.
            </p>

            <Link to="/roleSelection">
              Select Account Type
            </Link>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                Email Address
              </Form.Label>

              <Form.Control
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="py-2"
              />
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
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>

            <div className="text-center mt-4">
              <Link
                to={loginPath}
                state={
                  role !== "admin"
                    ? {
                        role:
                          role.charAt(0).toUpperCase() +
                          role.slice(1)
                      }
                    : undefined
                }
                className="text-decoration-none fw-semibold"
              >
                ← Back to Login
              </Link>
            </div>
          </Form>
        )}
      </div>
    </Container>
  );
};