
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert
} from "react-bootstrap";

import { getAllJobs } from "../../Api/postApi";
import { JobCard } from "../Jobs/jobCard";

export const StudentJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getAllJobs();
        const data = response.data;

        const jobList = Array.isArray(data)
          ? data
          : data.jobs ?? [];

        const activeJobs = jobList.filter(
          (job) => job.status === "active"
        );

        setJobs(activeJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <Container fluid className="px-4 py-4">
      <div className="mb-4">
        <h3 className="fw-bold">Available Jobs</h3>
        <p className="text-muted">
          Explore placement opportunities posted by recruiters.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : jobs.length === 0 ? (
        <Alert variant="info">
          No active jobs available.
        </Alert>
      ) : (
        <Row className="g-4">
          {jobs.map((job) => (
            <Col xl={6} xxl={4} md={6} key={job._id}>
              <JobCard job={job} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};
