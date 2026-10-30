
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, } from "react-bootstrap";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getStudentProfile, updateStudentProfile, uploadStudentResume, getStudentResume } from "../../Api/postApi";

import { FaArrowLeft, FaUser, FaCamera, FaGraduationCap, FaFileAlt, FaCog, FaFilePdf, FaSave, FaTimes, FaPlus, FaUpload, } from "react-icons/fa";
const normalizeLinkedin = (url) => {
  if (!url) return "";

  const cleaned = url
    .trim()
    .replace(/^(?:(?:https?:?\/{0,2})+)/i, "")
    .replace(/^\/+/, "");

  return `https://${cleaned}`;
};
export const EditProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    collegeEmail: "",
    phone: "",
    linkedin: "",
    github: "",
    address: "",
    course: "",
    college: "",
    startYear: "",
    endYear: "",
    cgpa: "",
    about: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [resume, setResume] = useState(null);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingResume, setExistingResume] = useState("");

  // Load signup details and any previously saved profile details.
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileResponse, resumeResponse] =
          await Promise.all([
            getStudentProfile(),
            getStudentResume()
          ]);

        const student =
          profileResponse.data.student || profileResponse.data;

        setFormData({
          fullName: student.fullName || "",
          collegeEmail: student.collegeEmail || "",
          phone: student.phone || "",
          linkedin: student.linkedin || "",
          github: student.github || "",
          address: student.address || "",
          course: student.course || "",
          college: student.college || "",
          startYear: student.startYear || "",
          endYear: student.endYear || "",
          cgpa: student.cgpa ?? "",
          about: student.about || "",
        });
        setSkills(Array.isArray(student.skills) ? student.skills : []);
        setExistingResume(resumeResponse.data.resumeUrl || "");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load profile");
        toast.error("Unable to load student profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview("");
      return;
    }

    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (
      !["image/jpeg", "image/png"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setError("Photo must be JPG or PNG, max 2MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setPhoto(file);
  };

  const handleResume = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (
      file.type !== "application/pdf" ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Resume must be PDF, max 5MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setResume(file);
  };

  const addSkill = () => {
    const value = skillInput.trim();

    if (
      value &&
      !skills.some(
        (skill) =>
          skill.toLowerCase() === value.toLowerCase()
      )
    ) {
      setSkills((prev) => [...prev, value]);
    }

    setSkillInput("");
  };

  const removeSkill = (value) => {
    setSkills((prev) =>
      prev.filter((skill) => skill !== value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasNewResume = Boolean(resume);
    toast.success(
      hasNewResume
        ? "Profile and resume updated successfully"
        : "Profile updated successfully"
    );

    if (saving) return;

    setSaving(true);
    setError("");

    const payload = {
      ...formData,
      linkedin: normalizeLinkedin(formData.linkedin),
      skills: skills,
    };

    // Registered email cannot be changed
    delete payload.collegeEmail;

    let profileSaved = false;

    try {
      // STEP 1: Update student profile details
      const response = await updateStudentProfile(payload);

      profileSaved = true;

      console.log("Updated Profile:", response.data);

      // STEP 2: Upload resume if a new file was selected
      if (resume) {
        const resumeFormData = new FormData();

        resumeFormData.append("resume", resume);

        const resumeResponse = await uploadStudentResume(
          resumeFormData
        );

        console.log(
          "Uploaded Resume:",
          resumeResponse.data
        );

        setExistingResume(resumeResponse.data.resumeUrl);
        setResume(null);
      }

      toast.success(
        resume
          ? "Profile and resume updated successfully"
          : "Profile updated successfully"
      );

      navigate("/studentDashboard/profile");

    } catch (err) {
      console.error("Profile Update Error:", err);

      const message =
        err.response?.data?.message ||
        (profileSaved
          ? "Profile saved, but resume upload failed. Please try again."
          : "Unable to update profile");

      setError(message);
      toast.error(message);

    } finally {
      setSaving(false);
    }
  };

  const cardStyle = {
    border: "1px solid #e4e9f3",
    borderRadius: "12px",
    backgroundColor: "#fff",
  };

  const titleStyle = {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111c42",
  };

  return (
    <Container
      fluid
      className="px-3 px-xl-4 py-4"
      style={{ backgroundColor: "#f7f9ff" }}
    >
      {/* HEADER */}

      <Row className="mb-4 align-items-center g-3">
        <Col>
          <h2 className="fw-bold mb-1">
            Edit Profile
          </h2>

          <p className="text-muted mb-0">
            Update your personal information, education
            details, skills and resume.
          </p>
        </Col>

        <Col xs="auto">
          <Button
            variant="outline-primary"
            className="px-3"
            onClick={() =>
              navigate("/studentDashboard/profile")
            }
          >
            <FaArrowLeft className="me-2" />
            Back to Profile
          </Button>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* MAIN TWO-COLUMN LAYOUT */}

        <Row className="g-3 align-items-stretch">

          {/* LEFT PROFILE PHOTO */}

          <Col lg={3}>
            <Card
              style={cardStyle}
              className="h-100 shadow-sm"
            >
              <Card.Body className="text-center p-4">

                <div
                  className="rounded-circle mx-auto d-flex justify-content-center align-items-center overflow-hidden mb-3"
                  style={{
                    width: "155px",
                    height: "155px",
                    backgroundColor: "#e8ecf5",
                    position: "relative",
                  }}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <FaUser
                      size={65}
                      color="#52618b"
                    />
                  )}
                </div>

                <Form.Label
                  htmlFor="profilePhoto"
                  className="btn btn-outline-primary px-4"
                >
                  <FaCamera className="me-2" />
                  Upload Photo
                </Form.Label>

                <Form.Control
                  type="file"
                  id="profilePhoto"
                  accept="image/png,image/jpeg"
                  className="d-none"
                  onChange={handlePhoto}
                />

                <p className="small text-muted mt-2">
                  JPG, PNG (Max 2MB)
                </p>

              </Card.Body>
            </Card>
          </Col>

          {/* RIGHT PERSONAL INFORMATION */}

          <Col lg={9}>
            <Card
              style={cardStyle}
              className="h-100 shadow-sm"
            >
              <Card.Body className="p-4">

                <h5
                  style={titleStyle}
                  className="mb-4"
                >
                  <FaUser className="me-2" />
                  Personal Information
                </h5>

                <Row className="g-3">

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        Full Name *
                      </Form.Label>

                      <Form.Control
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Email *</Form.Label>

                      <Form.Control
                        type="email"
                        name="collegeEmail"
                        value={formData.collegeEmail}
                        readOnly
                        placeholder="Enter email"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        Phone Number *
                      </Form.Label>

                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone number"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        LinkedIn URL
                      </Form.Label>

                      <Form.Control
                        type="text"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="LinkedIn profile"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        GitHub URL
                      </Form.Label>

                      <Form.Control
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        placeholder="GitHub profile"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        Address *
                      </Form.Label>

                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="City, State"
                        required
                      />
                    </Form.Group>
                  </Col>

                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* EDUCATION + ABOUT + SKILLS */}

        <Row className="g-3 mt-1">

          {/* EDUCATION LEFT */}

          <Col lg={6}>
            <Card
              style={cardStyle}
              className="h-100 shadow-sm"
            >
              <Card.Body className="p-4">

                <h5
                  style={titleStyle}
                  className="mb-4"
                >
                  <FaGraduationCap className="me-2" />
                  Education Details
                </h5>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Course *
                  </Form.Label>

                  <Form.Select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select Course
                    </option>
                    <option value="BCA">BCA</option>
                    <option value="BTech">B.Tech</option>
                    <option value="BBA">BBA</option>
                    <option value="MCA">MCA</option>
                    <option value="MBA">MBA</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    College / University *
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="Enter college name"
                    required
                  />
                </Form.Group>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Start Year *
                      </Form.Label>

                      <Form.Select
                        name="startYear"
                        value={formData.startYear}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select Year
                        </option>

                        {Array.from(
                          { length: 12 },
                          (_, i) => 2020 + i
                        ).map((year) => (
                          <option
                            key={year}
                            value={year}
                          >
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        End Year *
                      </Form.Label>

                      <Form.Select
                        name="endYear"
                        value={formData.endYear}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select Year
                        </option>

                        {Array.from(
                          { length: 12 },
                          (_, i) => 2020 + i
                        ).map((year) => (
                          <option
                            key={year}
                            value={year}
                          >
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mt-3">
                  <Form.Label>CGPA</Form.Label>

                  <Form.Control
                    type="number"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleChange}
                    placeholder="e.g. 9.60"
                    min="0"
                    max="10"
                    step="0.01"
                  />
                </Form.Group>

              </Card.Body>
            </Card>
          </Col>

          {/* ABOUT AND SKILLS RIGHT */}

          <Col lg={6}>
            <div className="d-flex flex-column gap-3 h-100">

              {/* ABOUT ME */}

              <Card
                style={cardStyle}
                className="shadow-sm flex-fill"
              >
                <Card.Body className="p-4">

                  <h5
                    style={titleStyle}
                    className="mb-3"
                  >
                    <FaFileAlt className="me-2" />
                    About Me
                  </h5>

                  <Form.Label>
                    About Me
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="about"
                    value={formData.about}
                    onChange={handleChange}
                    maxLength={300}
                    placeholder="Write about yourself and your career goals..."
                  />

                  <p className="text-end text-muted small mb-0 mt-1">
                    {formData.about.length}/300
                  </p>

                </Card.Body>
              </Card>

              {/* SKILLS */}

              <Card
                style={cardStyle}
                className="shadow-sm flex-fill"
              >
                <Card.Body className="p-4">

                  <h5
                    style={titleStyle}
                    className="mb-3"
                  >
                    <FaCog className="me-2" />
                    Skills
                  </h5>

                  <div className="d-flex gap-2 mb-3">
                    <Form.Control
                      type="text"
                      value={skillInput}
                      placeholder="Enter skill"
                      onChange={(e) =>
                        setSkillInput(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />

                    <Button
                      type="button"
                      variant="primary"
                      onClick={addSkill}
                    >
                      <FaPlus />
                    </Button>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        bg="light"
                        text="primary"
                        className="px-3 py-2 border"
                      >
                        {skill}

                        <FaTimes
                          className="ms-2"
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            removeSkill(skill)
                          }
                        />
                      </Badge>
                    ))}
                  </div>

                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>

        {/* RESUME FULL WIDTH */}

        <Row className="mt-3">
          <Col>
            <Card
              style={cardStyle}
              className="shadow-sm"
            >
              <Card.Body className="p-4">

                <h5
                  style={titleStyle}
                  className="mb-3"
                >
                  <FaFilePdf className="me-2" />
                  Resume
                </h5>

                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 border rounded-3 p-3">

                  <div className="d-flex align-items-center gap-3">
                    <FaFilePdf
                      size={30}
                      color="#334a80"
                    />

                    <div>
                      <p className="fw-semibold mb-1">
                        {resume
                          ? resume.name
                          : existingResume ? "Previously uploaded resume" : "No resume selected"}
                      </p>

                      <small className="text-muted">
                        PDF only (Max 5MB)
                      </small>
                    </div>
                  </div>

                  <div>
                    <Form.Label
                      htmlFor="resumeUpload"
                      className="btn btn-outline-primary mb-0"
                    >
                      <FaUpload className="me-2" />
                      {resume
                        ? "Change Resume"
                        : existingResume ? "Change Resume" : "Upload Resume"}
                    </Form.Label>

                    <Form.Control
                      id="resumeUpload"
                      type="file"
                      accept=".pdf,application/pdf"
                      className="d-none"
                      onChange={handleResume}
                    />
                  </div>

                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* BOTTOM BUTTONS */}

        <Row className="mt-3">
          <Col>
            <div className="d-flex justify-content-end gap-3 bg-white border rounded-3 p-3">

              <Button
                type="button"
                variant="outline-secondary"
                className="px-4"
                onClick={() =>
                  navigate("/studentDashboard/profile")
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading || saving}
                className="px-4"
                style={{
                  backgroundColor: "#4f46e5",
                  borderColor: "#4f46e5",
                }}
              >
                <FaSave className="me-2" />
                {saving ? "Saving..." : loading ? "Loading..." : "Save Changes"}
              </Button>

            </div>
          </Col>
        </Row>

      </Form>
    </Container>
  );
};
