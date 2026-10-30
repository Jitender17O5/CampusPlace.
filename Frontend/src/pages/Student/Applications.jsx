
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Form,
  InputGroup,
} from "react-bootstrap";

import {
  FaBriefcase,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSearch,
  FaMapMarkerAlt,
  FaBuilding,
  FaArrowRight,
  FaCalendarAlt,
  FaLaptopHouse,
  FaFilter,
} from "react-icons/fa";

import { getMyApplications } from "../../Api/postApi";
import "./application.css";

const filters = [
  "All",
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Hired",
  "Rejected",
];

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "shortlisted":
      return "app-status-shortlisted";
    case "hired":
      return "app-status-hired";
    case "rejected":
      return "app-status-rejected";
    case "under review":
      return "app-status-review";
    case "interview":
      return "app-status-interview";
    default:
      return "app-status-applied";
  }
};

export const Application = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    let active = true;

    const fetchApplications = async () => {
      try {
        const response = await getMyApplications();

        if (active) {
          setApplications(
            Array.isArray(response.data?.applications)
              ? response.data.applications
              : []
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
            "Unable to load applications"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchApplications();

    return () => {
      active = false;
    };
  }, []);

  const stats = [
    {
      title: "Total Applications",
      count: applications.length,
      icon: <FaBriefcase />,
      color: "#2563eb",
      bg: "#eff6ff",
    },
    {
      title: "Under Review",
      count: applications.filter(
        (app) => app.status?.toLowerCase() === "under review"
      ).length,
      icon: <FaClock />,
      color: "#d97706",
      bg: "#fffbeb",
    },
    {
      title: "Shortlisted",
      count: applications.filter(
        (app) => app.status?.toLowerCase() === "shortlisted"
      ).length,
      icon: <FaCheckCircle />,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      title: "Rejected",
      count: applications.filter(
        (app) => app.status?.toLowerCase() === "rejected"
      ).length,
      icon: <FaTimesCircle />,
      color: "#dc2626",
      bg: "#fef2f2",
    },
  ];

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const job = application.job;

      const matchesSearch =
        (job?.jobTitle || "").toLowerCase().includes(query) ||
        (job?.companyName || "").toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === "All" ||
        (application.status || "").toLowerCase() ===
        activeFilter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [applications, search, activeFilter]);

  if (loading) {
    return (
      <div className="application-loading">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-3">
          Loading your applications...
        </p>
      </div>
    );
  }

  return (
    <Container fluid className="application-page px-3 px-lg-4 py-4">

      {/* Page Header */}
      <div className="application-header mb-4">
        <div>
          <h2 className="fw-bold mb-2">My Applications</h2>
          <p className="mb-0">
            Track and manage your placement applications
            in one place.
          </p>
        </div>

        <Button
          variant="light"
          className="fw-semibold px-4"
          onClick={() => navigate("/studentDashboard/jobs")}
        >
          <FaBriefcase className="me-2" />
          Browse Jobs
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {!error && (
        <>
          {/* Statistics */}
          <Row className="g-3 mb-4">
            {stats.map((item) => (
              <Col sm={6} xl={3} key={item.title}>
                <Card className="application-stat-card h-100">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="app-stat-title mb-2">
                          {item.title}
                        </p>
                        <h2 className="fw-bold mb-0">
                          {item.count}
                        </h2>
                      </div>

                      <div
                        className="app-stat-icon"
                        style={{
                          backgroundColor: item.bg,
                          color: item.color,
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

          {/* Search and Filters */}
          <Card className="application-filter-card mb-4">
            <Card.Body className="p-4">
              <Row className="g-3 align-items-center">
                <Col lg={5}>
                  <InputGroup>
                    <InputGroup.Text className="app-search-icon">
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search job title or company..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="app-search-input"
                    />
                  </InputGroup>
                </Col>

                <Col lg={7}>
                  <div className="app-filter-list">
                    <FaFilter className="text-muted me-1" />

                    {filters.map((filter) => (
                      <button
                        type="button"
                        key={filter}
                        className={`app-filter-btn ${activeFilter === filter ? "active" : ""
                          }`}
                        onClick={() => setActiveFilter(filter)}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Results Heading */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              {activeFilter === "All"
                ? "All Applications"
                : `${activeFilter} Applications`}
            </h5>

            <span className="text-muted small">
              {filteredApplications.length} results
            </span>
          </div>

          {/* Empty State */}
          {filteredApplications.length === 0 && (
            <Card className="application-empty-state">
              <Card.Body className="text-center py-5">
                <div className="empty-app-icon">
                  <FaBriefcase />
                </div>

                <h5 className="fw-bold mt-3">
                  {applications.length === 0
                    ? "No applications yet"
                    : "No matching applications"}
                </h5>

                <p className="text-muted">
                  {applications.length === 0
                    ? "Start applying for jobs to track your progress here."
                    : "Try changing your search or status filter."}
                </p>

                {applications.length === 0 ? (
                  <Button
                    onClick={() =>
                      navigate("/studentDashboard/jobs")
                    }
                  >
                    Explore Jobs <FaArrowRight className="ms-2" />
                  </Button>
                ) : (
                  <Button
                    variant="outline-primary"
                    onClick={() => {
                      setSearch("");
                      setActiveFilter("All");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Application Cards */}
          <Row className="g-4">
            {filteredApplications.map((application) => {
              const job = application.job;

              const appliedDate = application.createdAt
                ? new Date(application.createdAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )
                : "Not available";

              return (
                <Col md={6} xl={4} key={application._id}>
                  <Card className="application-job-card h-100">
                    <Card.Body className="p-4 d-flex flex-column">

                      {/* Company and Status */}
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                        <div className="app-company-icon">
                          <FaBuilding />
                        </div>

                        <span
                          className={`app-status-badge ${getStatusClass(
                            application.status
                          )}`}
                        >
                          {application.status || "Applied"}
                        </span>
                      </div>

                      {/* Job Details */}
                      <h5 className="app-job-title">
                        {job?.jobTitle || "Job unavailable"}
                      </h5>

                      <p className="app-company-name">
                        {job?.companyName || "Unknown company"}
                      </p>

                      <div className="app-job-info">
                        <div>
                          <FaMapMarkerAlt />
                          <span>
                            {job?.location || "Not available"}
                          </span>
                        </div>

                        <div>
                          <FaBriefcase />
                          <span>
                            {job?.jobType || "Not available"}
                          </span>
                        </div>

                        <div>
                          <FaLaptopHouse />
                          <span>
                            {job?.workMode || "Not available"}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Section */}
                      <div className="app-card-footer mt-auto">
                        <p className="app-applied-date">
                          <FaCalendarAlt className="me-2" />
                          Applied on {appliedDate}
                        </p>

                        <Button
                          variant="outline-primary"
                          className="w-100"
                          disabled={!job?._id}
                          onClick={() =>
                            navigate(
                              `/studentDashboard/jobs/${job._id}`
                            )
                          }
                        >
                          View Job Details
                          <FaArrowRight className="ms-2" />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </>
      )}
    </Container>
  );
};
