
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert, Badge,
  Button
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import {
  FaBriefcase,
  FaUsers,
  FaCheckCircle
} from "react-icons/fa";

import { MdDashboard } from "react-icons/md";

import {
  getRecruiterJobs,
  getRecruiterApplicants
} from "../../Api/postApi";

export const RecruiterDashboard = () => {
  const navigate = useNavigate();

  const [recentApplicants, setRecentApplicants] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    shortlistedCandidates: 0,
    activeJobs: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [jobsResponse, applicantsResponse] =
          await Promise.all([
            getRecruiterJobs(),
            getRecruiterApplicants()
          ]);

        // Support the response formats used by your APIs
        const jobsData = jobsResponse.data;
        const applicantsData = applicantsResponse.data;

        const jobs = Array.isArray(jobsData)
          ? jobsData
          : jobsData.jobs || [];

        const applications = Array.isArray(applicantsData)
          ? applicantsData
          : applicantsData.applications || [];

        // Get the 5 most recent applications
        const latestApplicants = [...applications]
          .sort(
            (a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt)
          )
          .slice(0, 5);


        const latestJobs = [...jobs]
          .sort(
            (a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt)
          )
          .slice(0, 5)
          .map((job) => {
            const applicantCount = applications.filter(
              (application) =>
                String(application.job?._id || application.job) ===
                String(job._id)
            ).length;

            const deadline = job.deadline
              ? new Date(job.deadline)
              : null;

            // Include the entire deadline day
            if (deadline && !Number.isNaN(deadline.getTime())) {
              deadline.setHours(23, 59, 59, 999);
            }

            const isActive =
              job.status?.toLowerCase() === "active" &&
              (!deadline || deadline >= new Date());

            return {
              ...job,
              applicantCount,
              displayStatus: isActive ? "Active" : "Closed"
            };
          });


        // Count all jobs posted by this recruiter
        const totalJobs = jobs.length;

        // Count all applications received
        const totalApplicants = applications.length;

        // Count shortlisted candidates
        const shortlistedCandidates = applications.filter(
          (application) =>
            application.status === "Shortlisted"
        ).length;

        // Count active jobs whose deadlines haven't passed
        const now = new Date();

        const activeJobs = jobs.filter((job) => {
          const isActive =
            job.status?.toLowerCase() === "active";

          const deadlineValid =
            !job.deadline ||
            new Date(job.deadline) >= now;

          return isActive && deadlineValid;
        }).length;

        if (active) {
          setDashboardStats({
            totalJobs,
            totalApplicants,
            shortlistedCandidates,
            activeJobs
          });

          setRecentJobs(latestJobs);
          setRecentApplicants(latestApplicants);
        }

      } catch (err) {
        console.error("Dashboard data error:", err);

        if (active) {
          setError(
            err.response?.data?.message ||
            "Failed to load dashboard statistics"
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

  const stats = [
    {
      title: "Total Jobs Posted",
      value: dashboardStats.totalJobs,
      icon: <FaBriefcase size={26} />
    },
    {
      title: "Total Applicants",
      value: dashboardStats.totalApplicants,
      icon: <FaUsers size={26} />
    },
    {
      title: "Shortlisted Candidates",
      value: dashboardStats.shortlistedCandidates,
      icon: <FaCheckCircle size={26} />
    },
    {
      title: "Active Jobs",
      value: dashboardStats.activeJobs,
      icon: <MdDashboard size={26} />
    }
  ];

  return (
    <Container fluid className="p-0">

      {/* Dashboard Heading */}
      <div className="mb-4">
        <h3 className="fw-bold">
          Recruiter Dashboard
        </h3>

        <p className="text-muted">
          Manage your job postings and recruitment activities.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {/* Dashboard Statistics */}
      <Row className="g-4">
        {stats.map((item) => (
          <Col lg={3} md={6} key={item.title}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-2">
                      {item.title}
                    </p>

                    <h2 className="fw-bold mb-0">
                      {loading ? (
                        <Spinner
                          animation="border"
                          size="sm"
                        />
                      ) : (
                        item.value
                      )}
                    </h2>
                  </div>

                  <div style={{ color: "#0d6efd" }}>
                    {item.icon}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ========== RECENT JOB POSTINGS ========== */}

      <Row className="mt-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">

              {/* Section heading */}
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                  <h5 className="fw-bold mb-1">
                    Recent Job Postings
                  </h5>
                  <p className="text-muted mb-0">
                    Your latest recruitment opportunities
                  </p>
                </div>

                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    navigate("/recruiterDashboard/manage-jobs")
                  }
                >
                  View All Jobs
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" />
                  <p className="text-muted mt-2 mb-0">
                    Loading recent jobs...
                  </p>
                </div>
              ) : recentJobs.length === 0 ? (
                <div className="text-center py-5">
                  <FaBriefcase
                    size={35}
                    className="text-secondary mb-3"
                  />

                  <h6 className="fw-semibold">
                    No jobs posted yet
                  </h6>

                  <p className="text-muted">
                    Create your first job posting to get started.
                  </p>

                  <Button
                    onClick={() =>
                      navigate("/recruiterDashboard/post-job")
                    }
                  >
                    Post New Job
                  </Button>
                </div>
              ) : (
                recentJobs.map((job, index) => (
                  <div key={job._id}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 py-3">

                      {/* Job details */}
                      <div>
                        <h6 className="fw-bold mb-1">
                          {job.jobTitle}
                        </h6>

                        <p className="text-muted mb-2">
                          {job.companyName}
                          {" • "}
                          {job.jobType}
                          {" • "}
                          {job.location}
                        </p>

                        <div className="d-flex align-items-center gap-3 flex-wrap">
                          <span className="text-muted small">
                            <FaUsers className="me-1" />
                            {job.applicantCount} Applicants
                          </span>

                          <Badge
                            bg={
                              job.displayStatus === "Active"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {job.displayStatus}
                          </Badge>
                        </div>
                      </div>

                      {/* Posted date */}
                      <div className="text-muted small">
                        Posted:{" "}
                        {job.createdAt
                          ? new Date(job.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            }
                          )
                          : "N/A"}
                      </div>

                    </div>

                    {index !== recentJobs.length - 1 && (
                      <hr className="my-0" />
                    )}
                  </div>
                ))
              )}

            </Card.Body>
          </Card>
        </Col>
      </Row>


      {/* ========== RECENT APPLICANTS ========== */}

      <Row className="mt-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">

              {/* Section Header */}
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                  <h5 className="fw-bold mb-1">
                    Recent Applicants
                  </h5>

                  <p className="text-muted mb-0">
                    Latest applications received for your jobs
                  </p>
                </div>

                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    navigate("/recruiterDashboard/applicants")
                  }
                >
                  View All Applicants
                </Button>
              </div>

              {/* Loading */}
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" />
                  <p className="text-muted mt-2 mb-0">
                    Loading recent applicants...
                  </p>
                </div>

              ) : recentApplicants.length === 0 ? (

                /* Empty State */
                <div className="text-center py-5">
                  <FaUsers
                    size={36}
                    className="text-secondary mb-3"
                  />

                  <h6 className="fw-semibold">
                    No applicants yet
                  </h6>

                  <p className="text-muted mb-0">
                    Applications for your job postings
                    will appear here.
                  </p>
                </div>

              ) : (

                /* Applicants Table */
                <div className="table-responsive">
                  <table className="table align-middle mb-0">

                    <thead className="table-light">
                      <tr>
                        <th className="py-3">Candidate</th>
                        <th className="py-3">Applied For</th>
                        <th className="py-3">Applied Date</th>
                        <th className="py-3">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentApplicants.map((application) => {
                        const student = application.student;
                        const job = application.job;

                        const statusColor = {
                          Applied: "primary",
                          Shortlisted: "success",
                          Rejected: "danger",
                          Hired: "info"
                        };

                        return (
                          <tr key={application._id}>

                            {/* Candidate */}
                            <td className="py-3">
                              <div className="fw-semibold">
                                {student?.fullName || "Unknown Student"}
                              </div>

                              <small className="text-muted">
                                {student?.collegeEmail || "N/A"}
                              </small>
                            </td>

                            {/* Applied Job */}
                            <td>
                              <div className="fw-semibold">
                                {job?.jobTitle || "Job Unavailable"}
                              </div>

                              <small className="text-muted">
                                {job?.companyName || ""}
                              </small>
                            </td>

                            {/* Application Date */}
                            <td className="text-muted">
                              {application.createdAt
                                ? new Date(
                                  application.createdAt
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric"
                                })
                                : "N/A"}
                            </td>

                            {/* Status */}
                            <td>
                              <Badge
                                bg={
                                  statusColor[application.status] ||
                                  "secondary"
                                }
                                className="px-3 py-2"
                              >
                                {application.status || "Applied"}
                              </Badge>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>

                  </table>
                </div>
              )}

            </Card.Body>
          </Card>
        </Col>
      </Row>


    </Container>
  );
};
