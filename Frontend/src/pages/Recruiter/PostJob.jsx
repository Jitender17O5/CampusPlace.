
import { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { postNewJob } from "../../Api/postApi";

export const PostJob = () => {
  const initialFormData = {
    jobTitle: "",
    companyName: "",
    location: "",
    jobType: "",
    workMode: "",
    salary: "",
    experience: "",
    qualification: "",
    skills: "",
    deadline: "",
    description: "",
    requirements: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  // Handle all input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await postNewJob(formData);

      if (response.status === 201) {
        toast.success("Job posted successfully!");

        // Reset after MongoDB confirms saving
        setFormData(initialFormData);
      }
    } catch (error) {
      console.error("Post job error:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to post job. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <Container fluid className="p-0">
      <div className="mb-4">
        <h3 className="fw-bold">Post a New Job</h3>
        <p className="text-muted">
          Fill in the details below to publish a job opportunity.
        </p>
      </div>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="g-4">

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Job Title *</Form.Label>
                  <Form.Control
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g. MERN Stack Developer"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Company Name *</Form.Label>
                  <Form.Control
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Location *</Form.Label>
                  <Form.Control
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Gurugram"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Job Type *</Form.Label>
                  <Form.Select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select job type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Work Mode *</Form.Label>
                  <Form.Select
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select work mode</option>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Salary / Stipend</Form.Label>
                  <Form.Control
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. 4-6 LPA or ₹15,000/month"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Experience</Form.Label>
                  <Form.Select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                  >
                    <option value="">Select experience</option>
                    <option value="Fresher">Fresher</option>
                    <option value="0-1 years">0-1 years</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3+ years">3+ years</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Qualification</Form.Label>
                  <Form.Control
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g. BCA, B.Tech, MCA"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Required Skills</Form.Label>
                  <Form.Control
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="React, Node.js, MongoDB"
                  />
                  <Form.Text className="text-muted">
                    Separate skills using commas.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Application Deadline *</Form.Label>
                  <Form.Control
                    type="date"
                    name="deadline"
                    min={new Date().toLocaleDateString("en-CA")}
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Job Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the role and responsibilities..."
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Requirements</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="List the eligibility criteria and requirements..."
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <div className="d-flex justify-content-end gap-3">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => setFormData(initialFormData)}
                  >
                    Clear Form
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="px-4"
                  >
                    {loading ? "Processing..." : "Post Job"}
                  </Button>
                </div>
              </Col>

            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};
