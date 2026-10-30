import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from "react-bootstrap";
import {
  FaBuilding, FaGlobe, FaMapMarkerAlt, FaLinkedin, FaPhoneAlt,
  FaEnvelope, FaUserTie, FaEdit, FaSave, FaTimes, FaUsers,
  FaCalendarAlt, FaBriefcase, FaFileAlt, FaExternalLinkAlt,
  FaImage
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo,
  uploadCompanyBanner,
  submitRecruiterApproval
} from "../../Api/postApi";
import "./companyProfile.css";

const initialForm = {
  companyName: "", designation: "", industry: "", companyWebsite: "",
  companyLocation: "", companySize: "", foundedYear: "",
  companyDescription: "", companyLinkedin: "", companyPhone: ""
};

const externalUrl = (value) => {
  if (!value) return "#";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

// Existing locally stored logos remain visible; new ImageKit URLs work directly.
const imageUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("/uploads/")) return `http://localhost:5000${value}`;
  return externalUrl(value);
};

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="cp-detail-row">
      <Icon className="cp-detail-icon" aria-hidden="true" />
      <span className="cp-detail-label">{label}</span>
      <div className="cp-detail-value">{children}</div>
    </div>
  );
}

export const CompanyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [submittingApproval, setSubmittingApproval] = useState(false);

  useEffect(() => () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

  useEffect(() => () => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
  }, [bannerPreview]);

  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      try {
        const response = await getCompanyProfile();
        const recruiter = response.data.recruiter;
        if (active) {
          setProfile(recruiter);
          setFormData(Object.fromEntries(
            Object.keys(initialForm).map((key) => [key, recruiter[key] ?? ""])
          ));
        }
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Failed to load company profile");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProfile();
    return () => { active = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData(Object.fromEntries(
      Object.keys(initialForm).map((key) => [key, profile?.[key] ?? ""])
    ));
    setEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await updateCompanyProfile({
        ...formData,
        foundedYear: formData.foundedYear ? Number(formData.foundedYear) : null
      });
      setProfile(response.data.recruiter);
      setEditing(false);
      toast.success("Company profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update company profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitApproval = async () => {
    if (!window.confirm(
      "Submit your company profile for Admin approval?"
    )) {
      return;
    }

    try {
      setSubmittingApproval(true);

      const response = await submitRecruiterApproval();

      setProfile(response.data.recruiter);

      toast.success(
        response.data.message ||
        "Company profile submitted for approval"
      );
    } catch (err) {
      const data = err.response?.data;

      if (data?.missingFields?.length) {
        toast.error(
          `Missing fields: ${data.missingFields.join(", ")}`
        );
      } else {
        toast.error(
          data?.message || "Failed to submit approval request"
        );
      }
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleImageChange = (e, kind) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxMB = kind === "logo" ? 2 : 5;
    if (!allowedImageTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP images are allowed");
      e.target.value = "";
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`${kind === "logo" ? "Logo" : "Banner"} must be smaller than ${maxMB} MB`);
      e.target.value = "";
      return;
    }
    const preview = URL.createObjectURL(file);
    if (kind === "logo") {
      setLogoFile(file);
      setLogoPreview(preview);
    } else {
      setBannerFile(file);
      setBannerPreview(preview);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return toast.error("Please select a company logo");
    try {
      setUploadingLogo(true);
      const data = new FormData();
      data.append("companyLogo", logoFile);
      const response = await uploadCompanyLogo(data);
      setProfile((prev) => ({ ...prev, companyLogo: response.data.companyLogo }));
      setLogoFile(null);
      setLogoPreview("");
      toast.success("Company logo uploaded successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload company logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async () => {
    if (!bannerFile) return toast.error("Please select a company banner");
    try {
      setUploadingBanner(true);
      const data = new FormData();
      data.append("companyBanner", bannerFile);
      const response = await uploadCompanyBanner(data);
      setProfile((prev) => ({ ...prev, companyBanner: response.data.companyBanner }));
      setBannerFile(null);
      setBannerPreview("");
      toast.success("Company banner uploaded successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload company banner");
    } finally {
      setUploadingBanner(false);
    }
  };

  if (loading) return (
    <div className="text-center py-5"><Spinner animation="border" /><p className="mt-2">Loading company profile...</p></div>
  );
  if (error) return <Container className="py-4"><Alert variant="danger">{error}</Alert></Container>;
  if (!profile) return null;

  const logoSrc = imageUrl(profile.companyLogo);
  const bannerSrc = imageUrl(profile.companyBanner);
  const fallback = "Not provided";

  return (
    <Container fluid className="cp-page px-3 px-lg-4 py-4">
      <Card className="cp-card mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h5 className="mb-2">Recruiter Approval Status</h5>

              {profile.approvalStatus === "not_requested" && (
                <p className="text-muted mb-0">
                  Complete your company profile and submit it
                  for Admin approval.
                </p>
              )}

              {profile.approvalStatus === "pending" && (
                <Alert variant="warning" className="mb-0">
                  Your company profile is under Admin review.
                </Alert>
              )}

              {profile.approvalStatus === "approved" && (
                <Alert variant="success" className="mb-0">
                  Your recruiter account is approved.
                  You can now post jobs.
                </Alert>
              )}

              {profile.approvalStatus === "rejected" && (
                <Alert variant="danger" className="mb-0">
                  Your approval request was rejected.
                  Please contact the Admin.
                </Alert>
              )}
            </div>

            {profile.approvalStatus === "not_requested" && (
              <Button
                variant="primary"
                onClick={handleSubmitApproval}
                disabled={
                  submittingApproval ||
                  editing ||
                  saving ||
                  uploadingLogo ||
                  uploadingBanner
                }
              >
                {submittingApproval
                  ? "Submitting..."
                  : "Submit for Approval"}
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
      {!editing ? (
        <>
          <section className="cp-hero" style={bannerSrc ? { backgroundImage: `linear-gradient(90deg, rgba(232,241,255,.97) 0%, rgba(232,241,255,.88) 42%, rgba(232,241,255,.12) 100%), url("${bannerSrc}")` } : undefined}>
            <Button className="cp-edit-btn" onClick={() => setEditing(true)}>
              <FaEdit className="me-2" /> Edit Profile
            </Button>
            <div className="cp-hero-content">
              <div className="cp-logo-box">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={`${profile.companyName} logo`}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                      padding: 0
                    }}
                  />
                ) : (
                  <FaBuilding size={56} className="text-primary" />
                )}
              </div>
              <div className="cp-hero-info">
                <h1>{profile.companyName || "Company Name"}</h1>
                <p className="cp-industry">{profile.industry || "Industry not added"}</p>
                <div className="cp-hero-meta">
                  <span><FaMapMarkerAlt /> {profile.companyLocation || fallback}</span>
                  <span><FaUsers /> {profile.companySize ? `${profile.companySize} Employees` : "Company size not provided"}</span>
                  <span><FaCalendarAlt /> Founded: {profile.foundedYear || fallback}</span>
                </div>
              </div>
            </div>
          </section>

          <Row className="g-4 mt-1">
            <Col lg={7}>
              <Card className="cp-card h-100">
                <Card.Body>
                  <h2 className="cp-section-title"><span className="cp-title-icon"><FaBuilding /></span>Company Information</h2>
                  <DetailRow icon={FaMapMarkerAlt} label="Location">{profile.companyLocation || fallback}</DetailRow>
                  <DetailRow icon={FaCalendarAlt} label="Founded Year">{profile.foundedYear || fallback}</DetailRow>
                  <DetailRow icon={FaUsers} label="Company Size">{profile.companySize ? `${profile.companySize} Employees` : fallback}</DetailRow>
                  <DetailRow icon={FaBriefcase} label="Industry">{profile.industry || fallback}</DetailRow>
                  <DetailRow icon={FaGlobe} label="Website">
                    {profile.companyWebsite ? <a href={externalUrl(profile.companyWebsite)} target="_blank" rel="noopener noreferrer">{profile.companyWebsite} <FaExternalLinkAlt size={12} /></a> : fallback}
                  </DetailRow>
                  <DetailRow icon={FaLinkedin} label="LinkedIn">
                    {profile.companyLinkedin ? <a href={externalUrl(profile.companyLinkedin)} target="_blank" rel="noopener noreferrer">{profile.companyLinkedin} <FaExternalLinkAlt size={12} /></a> : fallback}
                  </DetailRow>
                  <DetailRow icon={FaPhoneAlt} label="Contact Number">{profile.companyPhone || fallback}</DetailRow>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={5}>
              <Card className="cp-card h-100">
                <Card.Body>
                  <h2 className="cp-section-title"><span className="cp-title-icon"><FaUserTie /></span>Recruiter Information</h2>
                  <div className="cp-recruiter-identity">
                    <div className="cp-avatar"><FaUserTie /></div>
                    <div>
                      <h3>{profile.fullName || "Recruiter"}</h3>
                      <span className="cp-role-pill">{profile.designation || "Recruiter"}</span>
                    </div>
                  </div>
                  <DetailRow icon={FaEnvelope} label="Email">{profile.email || fallback}</DetailRow>
                  <DetailRow icon={FaBriefcase} label="Designation">{profile.designation || fallback}</DetailRow>
                  <DetailRow icon={FaPhoneAlt} label="Company Phone">{profile.companyPhone || fallback}</DetailRow>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="cp-card mt-4">
            <Card.Body>
              <h2 className="cp-section-title"><span className="cp-title-icon"><FaFileAlt /></span>About Company</h2>
              <p className="cp-about">{profile.companyDescription || "Add a description of your company."}</p>
            </Card.Body>
          </Card>
        </>
      ) : (
        <Card className="cp-card cp-edit-card">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
              <div><h2 className="cp-edit-heading">Edit Company Profile</h2><p className="text-muted mb-0">Update your company details and images</p></div>
              <Button variant="outline-secondary" onClick={handleCancel} disabled={saving}><FaTimes className="me-2" />Cancel</Button>
            </div>

            <section className="cp-upload-section">
              <h3><FaImage className="me-2 text-primary" />Company Banner</h3>
              <div className="cp-banner-preview" style={bannerPreview || bannerSrc ? { backgroundImage: `url("${bannerPreview || bannerSrc}")` } : undefined}>
                {!bannerPreview && !bannerSrc && <span>Banner preview</span>}
              </div>
              <Form.Group className="mt-3">
                <Form.Label>Choose banner image</Form.Label>
                <Form.Control type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleImageChange(e, "banner")} />
                <Form.Text>JPG, PNG, or WebP. Maximum 5 MB. A wide landscape image works best.</Form.Text>
              </Form.Group>
              <Button type="button" className="mt-3" variant="outline-primary" disabled={!bannerFile || uploadingBanner} onClick={handleBannerUpload}>
                {uploadingBanner ? "Uploading Banner..." : "Upload Banner"}
              </Button>
            </section>

            <section className="cp-upload-section">
              <h3><FaBuilding className="me-2 text-primary" />Company Logo</h3>
              <div className="d-flex align-items-center flex-wrap gap-4">
                <div className="cp-logo-preview">
                  {logoPreview || logoSrc ? <img src={logoPreview || logoSrc} alt="Company logo preview" /> : <FaBuilding size={42} className="text-primary" />}
                </div>
                <div className="flex-grow-1">
                  <Form.Group>
                    <Form.Label>Choose company logo</Form.Label>
                    <Form.Control type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleImageChange(e, "logo")} />
                    <Form.Text>JPG, PNG, or WebP. Maximum 2 MB.</Form.Text>
                  </Form.Group>
                  <Button type="button" className="mt-3" variant="outline-primary" disabled={!logoFile || uploadingLogo} onClick={handleLogoUpload}>
                    {uploadingLogo ? "Uploading Logo..." : "Upload Logo"}
                  </Button>
                </div>
              </div>
            </section>

            <Form onSubmit={handleSave}>
              <h3 className="cp-form-section-title">Company Details</h3>
              <Row className="g-3">
                {[
                  ["companyName", "Company Name"], ["designation", "Your Designation"],
                  ["industry", "Industry"], ["companyWebsite", "Website"],
                  ["companyLocation", "Location"], ["companySize", "Company Size"],
                  ["foundedYear", "Founded Year"], ["companyLinkedin", "LinkedIn URL"],
                  ["companyPhone", "Company Phone"]
                ].map(([name, label]) => (
                  <Col md={6} key={name}>
                    <Form.Group>
                      <Form.Label>{label}</Form.Label>
                      <Form.Control name={name} type={name === "foundedYear" ? "number" : "text"} value={formData[name]} onChange={handleChange} required={name === "companyName"} />
                    </Form.Group>
                  </Col>
                ))}
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Company Description</Form.Label>
                    <Form.Control as="textarea" rows={5} name="companyDescription" value={formData.companyDescription} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex flex-wrap gap-2 mt-4">
                <Button type="submit" disabled={saving}><FaSave className="me-2" />{saving ? "Saving..." : "Save Changes"}</Button>
                <Button type="button" variant="outline-secondary" onClick={handleCancel} disabled={saving}><FaTimes className="me-2" />Cancel</Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};
