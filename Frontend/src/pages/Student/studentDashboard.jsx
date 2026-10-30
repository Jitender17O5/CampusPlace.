
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ProgressBar,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";

import { useNavigate } from "react-router-dom";

import {
  FaBriefcase,
  FaFileAlt,
  FaUserCheck,
  FaCalendarCheck,
  FaArrowRight,
  FaUserEdit,
  FaMapMarkerAlt,
  FaClock,
  FaBuilding,
} from "react-icons/fa";

import {
  getAllJobs,
  getMyApplications,
  getStudentProfile,
} from "../../Api/postApi";

import "./StudentDashboard.css";

export const StudentDashboard = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [student, setStudent] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchDashboardData = async () => {
      try {
        const [jobsResponse, applicationsResponse, profileResponse] =
          await Promise.all([
            getAllJobs(),
            getMyApplications(),
            getStudentProfile(),
          ]);

        if (!active) return;

        const jobsData = jobsResponse.data;
        const applicationsData = applicationsResponse.data;
        const profileData = profileResponse.data;

        setJobs(
          Array.isArray(jobsData)
            ? jobsData
            : jobsData?.jobs || []
        );

        setApplications(
          Array.isArray(applicationsData?.applications)
            ? applicationsData.applications
            : []
        );

        setStudent(
          profileData?.student ||
          profileData?.profile ||
          profileData
        );
      } catch (err) {
        if (active) {
          console.error("Dashboard error:", err);
          setError(
            err.response?.data?.message ||
            "Unable to load dashboard data"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      active = false;
    };
  }, []);

  // Application Statistics
  const appliedJobs = applications.length;

  const shortlisted = applications.filter(
    (app) => app.status?.toLowerCase() === "shortlisted"
  ).length;

  const interviews = applications.filter(
    (app) => app.status?.toLowerCase() === "interview"
  ).length;

  // Profile Completion
  const profileFields = [
    "fullName",
    "collegeEmail",
    "phone",
    "linkedin",
    "github",
    "address",
    "course",
    "college",
    "startYear",
    "endYear",
    "cgpa",
    "about",
  ];

  const completedFields = profileFields.filter((field) => {
    const value = student?.[field];
    return value !== undefined &&
      value !== null &&
      String(value).trim() !== "";
  }).length;

  const profileCompletion = student
    ? Math.round(
      (completedFields / profileFields.length) * 100
    )
    : 0;

  const stats = [
    {
      title: "Available Jobs",
      count: jobs.length,
      icon: <FaBriefcase />,
      color: "#2563eb",
      bg: "#eff6ff",
    },
    {
      title: "Applied Jobs",
      count: appliedJobs,
      icon: <FaFileAlt />,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      title: "Shortlisted",
      count: shortlisted,
      icon: <FaUserCheck />,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      title: "Interviews",
      count: interviews,
      icon: <FaCalendarCheck />,
      color: "#ea580c",
      bg: "#fff7ed",
    },
  ];

  // Latest 3 applications
  const recentApplications = [...applications]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 3);

  // Latest 3 jobs (temporary recommendation strategy)
  const recommendedJobs = [...jobs]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 3);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "shortlisted":
      case "hired":
        return "status-shortlisted";
      case "under review":
        return "status-review";
      default:
        return "status-applied";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return "Date unavailable";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-3">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <Container fluid className="student-dashboard px-3 px-lg-4 py-4">

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {!error && (
        <>
          {/* Welcome Banner */}
          <div className="dashboard-welcome mb-4">
            <Row className="align-items-center g-3">
              <Col md={8}>
                <h2 className="fw-bold mb-2">
                  Welcome back, {student?.fullName || "Student"}! 👋
                </h2>

                <p className="mb-0">
                  Discover opportunities, manage applications,
                  and take the next step in your career.
                </p>
              </Col>

              <Col md={4} className="text-md-end">
                <Button
                  variant="light"
                  className="fw-semibold px-4"
                  onClick={() =>
                    navigate("/studentDashboard/jobs")
                  }
                >
                  Explore Jobs
                  <FaArrowRight className="ms-2" />
                </Button>
              </Col>
            </Row>
          </div>

          {/* Statistics Cards */}
          <Row className="g-4 mb-4">
            {stats.map((item) => (
              <Col sm={6} xl={3} key={item.title}>
                <Card className="dashboard-stat-card h-100">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="stat-title mb-2">
                          {item.title}
                        </p>

                        <h2 className="fw-bold mb-0">
                          {item.count}
                        </h2>
                      </div>

                      <div
                        className="stat-icon"
                        style={{
                          color: item.color,
                          backgroundColor: item.bg,
                        }}
                      >
                        {item.icon}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Profile Completion */}
          <Card className="dashboard-section-card mb-4">
            <Card.Body className="p-4">
              <Row className="align-items-center g-3">
                <Col md={8}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaUserEdit className="text-primary fs-5" />

                    <h5 className="fw-bold mb-0">
                      Complete Your Profile
                    </h5>
                  </div>

                  <p className="text-muted small mb-3">
                    A complete profile helps recruiters learn more about you.
                  </p>

                  <div className="d-flex justify-content-between mb-2">
                    <span className="small fw-semibold">
                      Profile Completion
                    </span>

                    <span className="small fw-bold text-primary">
                      {profileCompletion}%
                    </span>
                  </div>

                  <ProgressBar
                    now={profileCompletion}
                    className="profile-progress"
                  />
                </Col>

                <Col md={4} className="text-md-end">
                  <Button
                    variant="outline-primary"
                    className="px-4"
                    onClick={() =>
                      navigate("/studentDashboard/profile/edit")
                    }
                  >
                    Complete Profile
                    <FaArrowRight className="ms-2" />
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Recent Applications and Jobs */}
          <Row className="g-4">

            {/* Recent Applications */}
            <Col lg={7}>
              <Card className="dashboard-section-card h-100">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="fw-bold mb-1">
                        Recent Applications
                      </h5>

                      <p className="text-muted small mb-0">
                        Track your latest job applications
                      </p>
                    </div>

                    <Button
                      variant="link"
                      className="text-decoration-none fw-semibold p-0"
                      onClick={() =>
                        navigate("/studentDashboard/applications")
                      }
                    >
                      View All
                      <FaArrowRight className="ms-1" />
                    </Button>
                  </div>

                  {recentApplications.length === 0 ? (
                    <p className="text-muted">
                      You haven't applied for any jobs yet.
                    </p>
                  ) : (
                    recentApplications.map((application) => {
                      const job = application.job;

                      return (
                        <div
                          className="application-item"
                          key={application._id}
                        >
                          <div className="application-icon">
                            <FaBuilding />
                          </div>

                          <div className="flex-grow-1">
                            <h6 className="fw-semibold mb-1">
                              {job?.jobTitle || "Job unavailable"}
                            </h6>

                            <p className="text-muted small mb-1">
                              {job?.companyName || "Unknown company"}
                            </p>

                            <span className="application-date">
                              <FaClock className="me-1" />
                              {formatDate(application.createdAt)}
                            </span>
                          </div>

                          <Badge
                            className={`application-status ${getStatusClass(
                              application.status
                            )}`}
                          >
                            {application.status || "Applied"}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Recommended Jobs */}
            <Col lg={5}>
              <Card className="dashboard-section-card h-100">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="fw-bold mb-1">
                        Latest Jobs
                      </h5>

                      <p className="text-muted small mb-0">
                        Explore recently posted opportunities
                      </p>
                    </div>

                    <Button
                      variant="link"
                      className="text-decoration-none fw-semibold p-0"
                      onClick={() =>
                        navigate("/studentDashboard/jobs")
                      }
                    >
                      View All
                    </Button>
                  </div>

                  {recommendedJobs.length === 0 ? (
                    <p className="text-muted">
                      No jobs available right now.
                    </p>
                  ) : (
                    recommendedJobs.map((job) => (
                      <div
                        className="recommended-job"
                        key={job._id}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <div className="job-company-icon">
                            <FaBriefcase />
                          </div>

                          <div className="flex-grow-1">
                            <h6 className="fw-semibold mb-1">
                              {job.jobTitle || "Untitled Job"}
                            </h6>

                            <p className="text-muted small mb-2">
                              {job.companyName || "Unknown company"}
                            </p>

                            <div className="d-flex flex-wrap gap-2 mb-3">
                              <span className="job-meta">
                                <FaMapMarkerAlt className="me-1" />
                                {job.location || "Not specified"}
                              </span>

                              <span className="job-meta">
                                <FaClock className="me-1" />
                                {job.jobType || "Not specified"}
                              </span>
                            </div>

                            <Button
                              variant="outline-primary"
                              size="sm"
                              disabled={!job._id}
                              onClick={() =>
                                navigate(
                                  `/studentDashboard/jobs/${job._id}`
                                )
                              }
                            >
                              View Details
                              <FaArrowRight className="ms-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};
