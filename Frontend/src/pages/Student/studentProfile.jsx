import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card, Spinner } from "react-bootstrap";
import {
  FaPhoneAlt, FaLinkedin, FaGithub, FaEdit, FaMapMarkerAlt,
  FaGraduationCap, FaFileAlt, FaUser, FaCode, FaUniversity,
  FaCalendarAlt, FaExternalLinkAlt, FaStar
} from "react-icons/fa";
import { useRef } from "react";
import { FaUpload, FaSyncAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { toast } from "react-toastify";
import imag from "../../assets/student.jpg";
import { getStudentProfile, getStudentResume, uploadStudentResume } from "../../Api/postApi";
import "./studentProfile.css";

const externalUrl = (url) => {
  if (!url || typeof url !== "string") return "#";
  const value = url.trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
};

export const StudentProfile = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumeUrl, setResumeUrl] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);

  const resumeInputRef = useRef(null);
  const editProfile = () => navigate("/studentDashboard/profile/edit");

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        const [profileResponse, resumeResponse] =
          await Promise.all([
            getStudentProfile(),
            getStudentResume()
          ]);

        if (active) {
          setStudent(
            profileResponse.data.student ||
            profileResponse.data
          );

          setResumeUrl(
            resumeResponse.data.resumeUrl || ""
          );
        }
      } catch (error) {
        console.error("Profile Fetch Error:", error);

        if (active) {
          toast.error(
            error.response?.data?.message ||
            "Unable to load student profile"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, []);
  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (
      file.type !== "application/pdf" ||
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("Please select a PDF file");
      event.target.value = "";
      return;
    }

    // Validate file size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume must be less than 5 MB");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setUploadingResume(true);

      const response = await uploadStudentResume(formData);

      setResumeUrl(response.data.resumeUrl);

      toast.success(
        response.data.message ||
        "Resume uploaded successfully"
      );

    } catch (error) {
      console.error("Resume Upload Error:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to upload resume"
      );

    } finally {
      setUploadingResume(false);

      // Allow selecting the same file again
      if (resumeInputRef.current) {
        resumeInputRef.current.value = "";
      }
    }
  };

  const handleViewResume = () => {
    if (!resumeUrl) {
      toast.info("Please upload your resume first");
      return;
    }

    window.open(
      resumeUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (loading) return (
    <Container className="py-5 text-center">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3 text-muted">Loading student profile...</p>
    </Container>
  );

  if (!student) return (
    <Container className="py-5 text-center">
      <h5>Unable to display student profile</h5>
    </Container>
  );

  const hasEducation = Boolean(
    student.course || student.college || student.startYear ||
    student.endYear || (student.cgpa !== undefined && student.cgpa !== null && student.cgpa !== "")
  );
  const hasContact = Boolean(student.address || student.phone || student.linkedin || student.github);

  return (
    <Container fluid className="student-profile-page px-0">
      <div className="profile-page-header profile-surface">
        <div className="d-flex align-items-center gap-3">
          <span className="profile-icon-box purple"><FaUser /></span>
          <div>
            <h2 className="profile-page-title mb-1">My Profile</h2>
            <p className="profile-subtitle mb-0">Manage your personal information and keep your profile updated</p>
          </div>
        </div>
        <Button className="profile-primary-btn" onClick={editProfile}>
          <FaEdit className="me-2" /> Edit Profile
        </Button>
      </div>

      <Card className="profile-hero profile-surface border-0">
        <Card.Body className="p-0">
          <Row className="g-4 align-items-center">
            <Col lg={7}>
              <div className="profile-identity">
                <div className="profile-avatar-wrap">
                  <img src={student.photo || imag} alt={student.fullName || "Student"} className="profile-avatar" onError={(e) => { e.currentTarget.src = imag; }} />
                </div>
                <div className="profile-identity-text">
                  <h3 className="profile-name">{student.fullName || "Student"}</h3>
                  {student.course && <span className="profile-course-pill">{student.course} Student</span>}
                  {student.collegeEmail && <p className="profile-meta mt-3"><MdEmail /> <span>{student.collegeEmail}</span></p>}
                  {student.college && <p className="profile-meta"><FaGraduationCap /> <span>{student.college}</span></p>}
                </div>
              </div>
            </Col>
            {hasContact && <Col lg={5}>
              <div className="profile-contact-details">
                {student.address && <div className="profile-contact-row"><FaMapMarkerAlt /><strong>Location</strong><span>{student.address}</span></div>}
                {student.phone && <div className="profile-contact-row"><FaPhoneAlt /><strong>Phone</strong><span>{student.phone}</span></div>}

                {student?.linkedin && (
                  <div className="profile-contact-row">
                    <FaLinkedin />

                    <strong>LinkedIn</strong>

                    <a
                      href={externalUrl(student.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Profile
                      <FaExternalLinkAlt size={11} className="ms-2" />
                    </a>
                  </div>
                )}

                {student.github && <div className="profile-contact-row"><FaGithub /><strong>GitHub</strong><a href={externalUrl(student.github)} target="_blank" rel="noopener noreferrer">View Profile <FaExternalLinkAlt size={11} /></a></div>}
              </div>
            </Col>}
          </Row>
        </Card.Body>
      </Card>

      {(student.about || hasEducation) && <Row className="g-4 mb-4">
        {student.about && <Col xs={12} lg={hasEducation ? 6 : 12}>
          <Card className="profile-section-card profile-surface h-100 border-0">
            <Card.Body>
              <div className="profile-section-heading">
                <span className="profile-icon-box purple"><FaUser /></span>
                <div className="flex-grow-1"><h4>About Me</h4><p>A short introduction about yourself</p></div>
                <button type="button" className="profile-edit-link" onClick={editProfile}><FaEdit /> Edit</button>
              </div>
              <p className="profile-about-text">{student.about}</p>
            </Card.Body>
          </Card>
        </Col>}
        {hasEducation && <Col xs={12} lg={student.about ? 6 : 12}>
          <Card className="profile-section-card profile-surface h-100 border-0">
            <Card.Body>
              <div className="profile-section-heading">
                <span className="profile-icon-box blue"><FaGraduationCap /></span>
                <div className="flex-grow-1"><h4>Education</h4><p>Your academic background</p></div>
                <button type="button" className="profile-edit-link" onClick={editProfile}><FaEdit /> Edit</button>
              </div>
              <div className="profile-education-list">
                {student.course && <div className="profile-education-item"><FaGraduationCap /><span>{student.course}</span></div>}
                {student.college && <div className="profile-education-item"><FaUniversity /><span>{student.college}</span></div>}
                {(student.startYear || student.endYear) && <div className="profile-education-item"><FaCalendarAlt /><span>{student.startYear || "—"} – {student.endYear || "—"}</span></div>}
                {student.cgpa !== undefined && student.cgpa !== null && student.cgpa !== "" && <div className="profile-education-item"><FaStar /><span><strong>CGPA:</strong> {student.cgpa}</span></div>}
              </div>
            </Card.Body>
          </Card>
        </Col>}
      </Row>}

      {Array.isArray(student.skills) && student.skills.length > 0 && <Card className="profile-section-card profile-surface border-0 mb-4">
        <Card.Body>
          <div className="profile-section-heading">
            <span className="profile-icon-box pink"><FaCode /></span>
            <div className="flex-grow-1"><h4>Technical Skills</h4><p>Your technical skills and competencies</p></div>
            <button type="button" className="profile-edit-link" onClick={editProfile}><FaEdit /> Edit</button>
          </div>
          <div className="profile-skills-list">
            {student.skills.map((skill, index) => <span key={`${skill}-${index}`} className={`profile-skill profile-skill-${index % 6}`}>{skill}</span>)}
          </div>
        </Card.Body>
      </Card>}

      {/* ================= RESUME MANAGEMENT ================= */}

      <Card className="profile-section-card profile-surface border-0 mb-4">
        <Card.Body>

          <div className="profile-section-heading">
            <span className="profile-icon-box blue">
              <FaFileAlt />
            </span>

            <div className="flex-grow-1">
              <h4>My Resume</h4>
              <p>
                Upload, view, and manage your resume
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">

            <div className="d-flex align-items-center gap-3">

              <span className="profile-icon-box blue">
                <FaFileAlt />
              </span>

              <div>
                <h6 className="fw-semibold mb-1">
                  {resumeUrl
                    ? "Resume Uploaded"
                    : "No Resume Uploaded"}
                </h6>

                <p className="profile-subtitle mb-0">
                  {resumeUrl
                    ? "Your resume is ready to view"
                    : "Upload your resume in PDF format (Max 5 MB)"}
                </p>
              </div>
            </div>

            <div className="d-flex align-items-center flex-wrap gap-2">

              {/* Hidden file input */}
              <input
                type="file"
                accept=".pdf,application/pdf"
                ref={resumeInputRef}
                onChange={handleResumeUpload}
                disabled={uploadingResume}
                style={{ display: "none" }}
              />

              {/* View Resume */}
              {resumeUrl && (
                <Button
                  variant="outline-primary"
                  onClick={handleViewResume}
                  disabled={uploadingResume}
                >
                  <FaExternalLinkAlt className="me-2" />
                  View Resume
                </Button>
              )}

              {/* Upload / Replace Resume */}
              <Button
                className="profile-primary-btn"
                disabled={uploadingResume}
                onClick={() => resumeInputRef.current?.click()}
              >
                {uploadingResume ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Uploading...
                  </>
                ) : (
                  <>
                    {resumeUrl ? (
                      <FaSyncAlt className="me-2" />
                    ) : (
                      <FaUpload className="me-2" />
                    )}

                    {resumeUrl
                      ? "Replace Resume"
                      : "Upload Resume"}
                  </>
                )}
              </Button>

            </div>
          </div>

        </Card.Body>
      </Card>
    </Container>
  );
};
