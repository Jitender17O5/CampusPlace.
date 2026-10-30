import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert
} from "react-bootstrap";

import {
  FaUserGraduate,
  FaBuilding,
  FaBriefcase,
  FaClipboardList
} from "react-icons/fa";

import { getAdminDashboardStats } from "../../Api/postApi";

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRecruiters: 0,
    totalJobs: 0,
    totalApplications: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchDashboardStats = async () => {
      try {
        const response = await getAdminDashboardStats();

        if (active) {
          setStats(response.data.stats);
          setError("");
        }
      } catch (err) {
        console.error("Admin dashboard error:", err);

        if (active) {
          setError("Failed to load dashboard statistics.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDashboardStats();

    return () => {
      active = false;
    };
  }, []);

  const dashboardCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: FaUserGraduate,
      color: "text-primary"
    },
    {
      title: "Total Recruiters",
      value: stats.totalRecruiters,
      icon: FaBuilding,
      color: "text-success"
    },
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      icon: FaBriefcase,
      color: "text-warning"
    },
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: FaClipboardList,
      color: "text-info"
    }
  ];

  return (
    <Container fluid className="p-0">

      {/* Dashboard Heading */}
      <div className="mb-4">
        <h2 className="fw-bold mb-2">
          Admin Dashboard
        </h2>

        <p className="text-muted">
          Welcome to the Campus Placement Portal Admin Panel.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Row className="g-4">
        {dashboardCards.map((card) => {
          const Icon = card.icon;

          return (
            <Col xl={3} md={6} key={card.title}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body className="p-4">

                  <Icon
                    size={30}
                    className={`${card.color} mb-3`}
                  />

                  <h6 className="text-muted">
                    {card.title}
                  </h6>

                  {loading ? (
                    <Spinner
                      animation="border"
                      size="sm"
                    />
                  ) : error ? (
                    <h2 className="fw-bold mb-0">—</h2>
                  ) : (
                    <h2 className="fw-bold mb-0">
                      {card.value}
                    </h2>
                  )}

                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Welcome Section */}
      <Row className="mt-4">
        <Col>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold">
                Admin Management Panel
              </h5>

              <p className="text-muted mb-0">
                From this dashboard, you will be able to
                manage registered students, recruiters,
                job postings, and applications.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Container>
  );
};