
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Alert, Button
} from "react-bootstrap";
import { FaFilePdf, FaExternalLinkAlt } from "react-icons/fa";
import { getRecruiterApplicants } from "../../Api/postApi";

export const Applicants = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchApplicants = async () => {
      try {
        const response = await getRecruiterApplicants();

        if (active) {
          setApplications(response.data.applications || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
            "Failed to load applicants"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchApplicants();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p>Loading applicants...</p>
      </div>
    );
  }

  return (
    <Container fluid className="px-4 py-4">

      {/* Page Heading */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Applicants</h3>
        <p className="text-muted mb-0">
          View students who applied to your posted jobs.
        </p>
      </div>

      {/* Applicant Count */}
      {!error && (
        <div className="mb-4">
          <Badge bg="primary" className="px-3 py-2">
            Total Applications: {applications.length}
          </Badge>
        </div>
      )}

      {error ? (
        <Alert variant="danger">{error}</Alert>
      ) : applications.length === 0 ? (
        <Card className="border-0 shadow-sm text-center p-5">
          <h5>No applicants yet</h5>
          <p className="text-muted mb-0">
            Students who apply to your jobs will appear here.
          </p>
        </Card>
      ) : (
        <Row className="g-4">
          {applications.map((application) => {
            const student = application.student;
            const job = application.job;

            return (
              <Col md={6} xl={4} key={application._id}>
                <Card className="h-100 border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4">

                    {/* Student Details */}
                    <div className="d-flex justify-content-between gap-2 mb-3">
                      <div>
                        <h5 className="fw-bold mb-1">
                          {student?.fullName || "Student unavailable"}
                        </h5>

                        <p className="text-muted mb-0">
                          {student?.collegeEmail || "No email"}
                        </p>
                      </div>

                      <Badge
                        bg={
                          application.status === "Shortlisted"
                            ? "success"
                            : application.status === "Rejected"
                              ? "danger"
                              : application.status === "Hired"
                                ? "info"
                                : "primary"
                        }
                        className="align-self-start"
                      >
                        {application.status}
                      </Badge>
                    </div>

                    {/* Applied Job */}
                    <div className="bg-light rounded-3 p-3 mb-3">
                      <small className="text-muted">
                        Applied For
                      </small>

                      <h6 className="fw-bold mb-0">
                        {job?.jobTitle || "Job unavailable"}
                      </h6>

                      <small className="text-muted">
                        {job?.companyName || ""}
                      </small>
                    </div>

                    {/* Student Information */}
                    <p className="mb-2">
                      <strong>Course:</strong>{" "}
                      {student?.course || "Not provided"}
                    </p>

                    <p className="mb-2">
                      <strong>College:</strong>{" "}
                      {student?.college || "Not provided"}
                    </p>

                    <p className="mb-2">
                      <strong>CGPA:</strong>{" "}
                      {student?.cgpa ?? "Not provided"}
                    </p>

                    <p className="mb-2">
                      <strong>Phone:</strong>{" "}
                      {student?.phone || "Not provided"}
                    </p>

                    <p className="text-muted small mt-3 mb-0">
                      Applied on:{" "}
                      {application.createdAt
                        ? new Date(
                          application.createdAt
                        ).toLocaleDateString("en-IN")
                        : "Not available"}
                    </p>
                    {/* Student Resume */}
                    <div className="mt-3 pt-3 border-top">
                      {student?.resumeUrl ? (
                        <Button
                          variant="outline-primary"
                          className="w-100"
                          onClick={() => {
                            window.open(
                              student.resumeUrl,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }}
                        >
                          <FaFilePdf className="me-2" />
                          View Resume
                          <FaExternalLinkAlt className="ms-2" size={11} />
                        </Button>
                      ) : (
                        <Button
                          variant="outline-secondary"
                          className="w-100"
                          disabled
                        >
                          <FaFilePdf className="me-2" />
                          Resume Not Uploaded
                        </Button>
                      )}
                    </div>

                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};
