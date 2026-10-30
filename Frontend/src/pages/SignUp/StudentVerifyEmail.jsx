import { useEffect, useState } from "react";
import { Container, Button, Form, Spinner } from "react-bootstrap";
import { GiGraduateCap } from "react-icons/gi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
    verifyStudentEmail,
    resendStudentOtp,
    verifyRecruiterEmail,
    resendRecruiterOtp
} from "../../Api/postApi";

export const StudentVerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;

    // Identify whether the user is a student or recruiter
    const isRecruiter =
        location.pathname.startsWith("/recruiter/") ||
        location.state?.role?.toLowerCase() === "recruiter";

    const role = isRecruiter ? "Recruiter" : "Student";

    // Redirect to the correct signup page
    const signupPath = isRecruiter
        ? "/recruiterSignup"
        : "/studentSignup";

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        if (!email) {
            toast.error("Please register first");

            navigate(signupPath, {
                replace: true,
                state: { role }
            });
        }
    }, [email, navigate, signupPath, role]);

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setTimeout(() => {
            setCountdown((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!email || !/^\d{6}$/.test(otp)) {
            toast.error("Enter a valid 6-digit OTP");
            return;
        }

        try {
            setLoading(true);

            const response = isRecruiter
                ? await verifyRecruiterEmail({ email, otp })
                : await verifyStudentEmail({ email, otp });

            toast.success(
                response.data.message || "Email verified successfully"
            );

            navigate("/login", {
                replace: true,
                state: { role }
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
    const handleResend = async () => {
        if (!email || resending || countdown > 0) return;

        try {
            setResending(true);

            const response = isRecruiter
                ? await resendRecruiterOtp({ email })
                : await resendStudentOtp({ email });

            toast.success(
                response.data.message || "New OTP sent successfully"
            );

            setOtp("");
            setCountdown(60);

        } catch (error) {
            const retryAfter =
                error.response?.data?.retryAfterSeconds;

            if (Number.isFinite(retryAfter) && retryAfter > 0) {
                setCountdown(Math.ceil(retryAfter));
            }

            toast.error(
                error.response?.data?.message ||
                "Unable to resend OTP"
            );
        } finally {
            setResending(false);
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
                    backgroundColor: "#fff"
                }}
            >
                <div className="text-center mb-4">
                    <GiGraduateCap
                        size={60}
                        className="mb-2"
                        style={{ color: "#5316f9" }}
                    />

                    <h2 className="fw-bold mb-2">
                        Verify {role} Email
                    </h2>

                    <p className="text-muted mb-1">
                        Enter the 6-digit verification code sent to
                    </p>

                    <p
                        className="fw-semibold"
                        style={{
                            color: "#5316f9",
                            overflowWrap: "anywhere"
                        }}
                    >
                        {email}
                    </p>
                </div>

                <Form onSubmit={handleVerify}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                            Verification Code
                        </Form.Label>

                        <Form.Control
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => {
                                const value = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 6);

                                setOtp(value);
                            }}
                            placeholder="Enter 6-digit OTP"
                            className="py-3 text-center fw-bold"
                            style={{
                                fontSize: "24px",
                                letterSpacing: "8px"
                            }}
                            required
                        />
                    </Form.Group>

                    <p className="text-muted text-center small">
                        The verification code expires after 5 minutes.
                    </p>

                    <Button
                        type="submit"
                        disabled={loading || otp.length !== 6 || !email}
                        className="w-100 py-2 fw-semibold border-0"
                        style={{ backgroundColor: "#5316f9" }}
                    >
                        {loading ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Verifying...
                            </>
                        ) : (
                            "Verify Email"
                        )}
                    </Button>
                </Form>

                <div className="text-center mt-4">
                    <p className="text-muted mb-2">
                        Didn't receive the code?
                    </p>

                    <Button
                        variant="link"
                        onClick={handleResend}
                        disabled={countdown > 0 || resending || !email}
                        className="text-decoration-none fw-semibold"
                        style={{ color: "#5316f9" }}
                    >
                        {resending
                            ? "Sending..."
                            : countdown > 0
                                ? `Resend OTP in ${countdown}s`
                                : "Resend OTP"}
                    </Button>
                </div>

                <div className="text-center mt-3">
                    <Link
                        to={signupPath}
                        state={{ role }}
                        className="text-decoration-none fw-semibold"
                        style={{ color: "#5316f9" }}
                    >
                        ← Back to Registration
                    </Link>
                </div>
            </div>
        </Container>
    );
};