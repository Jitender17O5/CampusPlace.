
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";

import {
  getRecruiterJobs,
  deleteRecruiterJob
} from "../../Api/postApi";

export const ManageJobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    try {
      setError("");

      const response = await getRecruiterJobs();

      setJobs(response.data.jobs || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load jobs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this job?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(jobId);

      await deleteRecruiterJob(jobId);

      setJobs((prev) =>
        prev.filter((job) => job._id !== jobId)
      );

      toast.success("Job deleted successfully");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Failed to delete job"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Container fluid className="px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h3 className="fw-bold mb-1">Manage Jobs</h3>
          <p className="text-muted mb-0">
            View and manage your posted jobs.
          </p>
        </div>

        <Button
          onClick={() =>
            navigate("/recruiterDashboard/post-job")
          }
        >
          <FiPlus className="me-2" />
          Post New Job
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p>Loading your jobs...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : jobs.length === 0 ? (
        <Card className="border-0 shadow-sm text-center p-5">
          <h5>No jobs posted yet</h5>
          <p className="text-muted">
            Post your first job to see it here.
          </p>
          <Button
            onClick={() =>
              navigate("/recruiterDashboard/post-job")
            }
          >
            Post a Job
          </Button>
        </Card>
      ) : (
        <Row className="g-4">
          {jobs.map((job) => (
            <Col md={6} xl={4} key={job._id}>
              <Card className="h-100 border-0 shadow-sm rounded-4">
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between gap-2 mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">
                        {job.jobTitle}
                      </h5>
                      <p className="text-muted mb-0">
                        {job.companyName}
                      </p>
                    </div>

                    <Badge
                      bg={
                        job.status === "active"
                          ? "success"
                          : "secondary"
                      }
                      className="align-self-start"
                    >
                      {job.status}
                    </Badge>
                  </div>

                  <p className="mb-2">
                    <strong>Location:</strong> {job.location}
                  </p>

                  <p className="mb-2">
                    <strong>Job Type:</strong> {job.jobType}
                  </p>

                  <p className="mb-2">
                    <strong>Work Mode:</strong> {job.workMode}
                  </p>

                  <p className="mb-2">
                    <strong>Deadline:</strong>{" "}
                    {job.deadline
                      ? new Date(job.deadline).toLocaleDateString("en-IN")
                      : "Not specified"}
                  </p>

                  <p className="text-muted small mt-2">
                    Posted:{" "}
                    {new Date(job.createdAt).toLocaleDateString("en-IN")}
                  </p>

                  <div className="d-flex gap-2 mt-auto pt-3">
                    <Button
                      variant="outline-primary"
                      className="flex-fill"
                      onClick={() =>
                        navigate(
                          `/recruiterDashboard/edit-job/${job._id}`
                        )
                      }
                    >
                      <FiEdit2 className="me-2" />
                      Edit
                    </Button>

                    <Button
                      variant="outline-danger"
                      className="flex-fill"
                      disabled={deletingId === job._id}
                      onClick={() => handleDelete(job._id)}
                    >
                      <FiTrash2 className="me-2" />
                      {deletingId === job._id
                        ? "Deleting..."
                        : "Delete"}
                    </Button>

                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};
