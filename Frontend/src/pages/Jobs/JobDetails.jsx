
import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate
} from "react-router-dom";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert
} from "react-bootstrap";

import {
  LuMapPin,
  LuClock3,
  LuBriefcaseBusiness
} from "react-icons/lu";

import {
  getJobById,
  applyForJob,
  getMyApplications
} from "../../Api/postApi";

import { toast } from "react-toastify";

export const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ================= STATES =================

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [checkingApplication, setCheckingApplication] =
    useState(true);

  const [applicationError, setApplicationError] =
    useState("");

  const studentToken =
    sessionStorage.getItem("studentToken");

  // ================= FETCH JOB =================

  useEffect(() => {
    let active = true;

    const fetchJob = async () => {
      setLoading(true);
      setError("");
      setJob(null);

      try {
        const response = await getJobById(id);

        if (active) {
          setJob(response.data.job);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
            "Unable to load job details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchJob();

    return () => {
      active = false;
    };
  }, [id]);

  // ================= CHECK APPLICATION =================

  useEffect(() => {
    let active = true;

    const checkApplication = async () => {
      setApplied(false);
      setApplicationError("");

      if (!studentToken) {
        setCheckingApplication(false);
        return;
      }

      setCheckingApplication(true);

      try {
        const response = await getMyApplications();

        const applications =
          response.data.applications || [];

        const alreadyApplied = applications.some(
          (application) =>
            String(
              application.job?._id ||
              application.job
            ) === String(id)
        );

        if (active) {
          setApplied(alreadyApplied);
        }

      } catch (err) {
        if (active) {
          setApplicationError(
            err.response?.data?.message ||
            "Unable to verify application status."
          );
        }
      } finally {
        if (active) {
          setCheckingApplication(false);
        }
      }
    };

    checkApplication();

    return () => {
      active = false;
    };
  }, [id, studentToken]);

  // ================= APPLY FOR JOB =================

  const handleApply = async () => {
    if (!studentToken) {
      toast.info("Please login as a student to apply");
      navigate("/roleSelection");
      return;
    }

    if (
      applied ||
      applying ||
      checkingApplication ||
      applicationError ||
      !job ||
      job.status !== "active" ||
      (job.deadline && new Date(job.deadline) < new Date())
    ) {
      return;
    }

    setApplying(true);

    try {
      const response = await applyForJob(id);

      setApplied(true);

      toast.success(
        response.data.message ||
        "Job applied successfully!"
      );

    } catch (err) {
      if (err.response?.status === 409) {
        setApplied(true);
        toast.info("You have already applied for this job");
      } else {
        toast.error(
          err.response?.data?.message ||
          "Failed to apply for job"
        );
      }
    } finally {
      setApplying(false);
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p>Loading job details...</p>
      </div>
    );
  }

  // ================= ERROR =================

  if (error || !job) {
    return (
      <Container className="py-5">
        <p className="text-danger">
          {error || "Job not found."}
        </p>

        <Button onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  // ================= SKILLS =================

  const skills = Array.isArray(job.skills)
    ? job.skills
    : typeof job.skills === "string"
      ? job.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      : [];

  const isExpired =
    job.deadline &&
    new Date(job.deadline) < new Date();

  const isClosed =
    job.status !== "active" || isExpired;

  // ================= UI =================

  return (
    <Container className="py-4">

      {/* BACK BUTTON */}
      <Button
        variant="link"
        className="ps-0 mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back to Jobs
      </Button>

      {/* JOB HEADER */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">

          <div className="d-flex justify-content-between flex-wrap gap-3">
            <div>
              <h2 className="fw-bold">
                {job.jobTitle}
              </h2>

              <h5 className="text-muted">
                {job.companyName}
              </h5>
            </div>

            <Badge
              bg="success"
              className="align-self-start p-2"
            >
              {job.jobType}
            </Badge>
          </div>

          <div className="d-flex flex-wrap gap-4 mt-3 text-muted">
            <span>
              <LuMapPin /> {job.location}
            </span>

            <span>
              <LuBriefcaseBusiness /> {job.workMode}
            </span>

            <span>
              <LuClock3 /> Posted{" "}
              {job.createdAt
                ? new Date(
                  job.createdAt
                ).toLocaleDateString("en-IN")
                : "Recently"}
            </span>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">

        {/* JOB DESCRIPTION */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">

              <h4 className="fw-bold mb-3">
                Job Description
              </h4>

              <p style={{ whiteSpace: "pre-line" }}>
                {job.description || "Not provided"}
              </p>

              <hr />

              <h4 className="fw-bold mb-3">
                Requirements
              </h4>

              <p style={{ whiteSpace: "pre-line" }}>
                {job.requirements || "Not provided"}
              </p>

              <hr />

              <h4 className="fw-bold mb-3">
                Required Skills
              </h4>

              <div className="d-flex flex-wrap gap-2">
                {skills.length ? (
                  skills.map((skill, index) => (
                    <Badge
                      key={index}
                      bg="light"
                      text="primary"
                      className="p-2 border"
                    >
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted">
                    Not specified
                  </p>
                )}
              </div>

            </Card.Body>
          </Card>
        </Col>

        {/* JOB OVERVIEW */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">

              <h5 className="fw-bold mb-4">
                Job Overview
              </h5>

              <p>
                <strong>Salary / Stipend:</strong>{" "}
                {job.salary || "Not disclosed"}
              </p>

              <p>
                <strong>Experience:</strong>{" "}
                {job.experience || "Not specified"}
              </p>

              <p>
                <strong>Qualification:</strong>{" "}
                {job.qualification || "Not specified"}
              </p>

              <p>
                <strong>Job Type:</strong>{" "}
                {job.jobType}
              </p>

              <p>
                <strong>Work Mode:</strong>{" "}
                {job.workMode}
              </p>

              <p>
                <strong>Deadline:</strong>{" "}
                {job.deadline
                  ? new Date(
                    job.deadline
                  ).toLocaleDateString("en-IN")
                  : "Not specified"}
              </p>

              {applicationError && (
                <Alert variant="danger">
                  {applicationError}
                </Alert>
              )}

              {/* APPLY BUTTON */}
              <Button
                className="w-100 mt-3"
                variant={
                  applied ? "success" : "primary"
                }
                disabled={
                  Boolean(isClosed) ||
                  applied ||
                  applying ||
                  checkingApplication ||
                  Boolean(applicationError)
                }
                onClick={handleApply}
              >
                {applied
                  ? "✓ Already Applied"
                  : isClosed
                    ? "Applications Closed"
                    : checkingApplication
                      ? "Checking..."
                      : applying
                        ? "Applying..."
                        : "Apply Now"}
              </Button>

              {/* VIEW APPLICATIONS */}
              {applied && (
                <Button
                  variant="outline-primary"
                  className="w-100 mt-2"
                  onClick={() =>
                    navigate(
                      "/studentDashboard/applications"
                    )
                  }
                >
                  View My Applications
                </Button>
              )}

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
