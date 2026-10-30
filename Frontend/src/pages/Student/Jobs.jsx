
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from "react-bootstrap";
import { FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave } from "react-icons/fa";
// import { getAllJobs } from "../../Api/jobApi";
import { getAllJobs } from "../../Api/postApi";

export const StudentJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getAllJobs();

        // Supports both array and { jobs: [...] } responses
        const jobList = Array.isArray(data)
          ? data
          : data.jobs ?? [];

        setJobs(jobList.filter(job => job.status === "active"));
      } catch (err) {
        console.error(err);
        setError("Unable to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
        <p>Loading available jobs...</p>
      </div>
    );
  }

  return (
    <Container fluid className="px-4 py-4 bg-light">
      <div className="mb-4">
        <h3 className="fw-bold">Explore Jobs</h3>
        <p className="text-muted">
          Discover opportunities matching your skills.
        </p>
        <Badge bg="primary">{jobs.length} Available Jobs</Badge>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        {jobs.map((job) => (
          <Col lg={4} md={6} key={job._id}>
            <Card className="h-100 shadow-sm border-0 rounded-3">
              <Card.Body className="d-flex flex-column">
                <h5 className="fw-bold">{job.jobTitle}</h5>
                <p className="text-primary fw-semibold">
                  {job.companyName}
                </p>

                <p className="text-muted mb-2">
                  <FaMapMarkerAlt className="me-2" />
                  {job.location}
                </p>

                <p className="mb-2">
                  <FaBriefcase className="me-2" />
                  {job.jobType} | {job.workMode}
                </p>

                <p className="mb-2">
                  <FaMoneyBillWave className="me-2" />
                  {job.salary || "Not disclosed"}
                </p>

                <p className="text-muted small">
                  {job.description?.slice(0, 110)}...
                </p>

                <div className="mb-3">
                  {job.skills?.slice(0, 4).map((skill) => (
                    <Badge
                      bg="light"
                      text="dark"
                      className="me-1 mb-1 border"
                      key={skill}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                <Button
                  variant="primary"
                  className="mt-auto w-100"
                >
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {!error && jobs.length === 0 && (
        <Alert variant="info" className="mt-4">
          No active jobs available right now.
        </Alert>
      )}
    </Container>
  );
};
