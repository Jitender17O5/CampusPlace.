
import { useEffect, useState } from "react";
import { Button, Spinner, Alert, Badge, Modal, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import {
    getAdminRecruiterRequests,
    updateAdminRecruiterApproval
} from "../../Api/postApi";

export const AdminApplications = () => {
    const [recruiters, setRecruiters] = useState([]);
    const [filter, setFilter] = useState("pending");
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState("");
    const [selectedRecruiter, setSelectedRecruiter] = useState(null);

    const fetchRequests = async () => {
        try {
            setError("");
            const response = await getAdminRecruiterRequests();
            setRecruiters(response.data.recruiters || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load recruiter requests"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApproval = async (recruiterId, approvalStatus) => {
        const action = approvalStatus === "approved" ? "approve" : "reject";

        if (!window.confirm(`Are you sure you want to ${action} this recruiter?`)) {
            return;
        }

        try {
            setProcessingId(recruiterId);

            const response = await updateAdminRecruiterApproval(
                recruiterId,
                approvalStatus
            );
            console.log(response)

            setRecruiters((prev) =>
                prev.map((recruiter) =>
                    recruiter._id === recruiterId
                        ? { ...recruiter, approvalStatus }
                        : recruiter
                )
            );

            toast.success(response.data.message);

            if (response.data.emailSent === false) {
                toast.warning("Decision saved, but notification email was not sent.");
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to update approval"
            );
        } finally {
            setProcessingId(null);
        }
    };

    const counts = {
        pending: recruiters.filter((r) => (r.approvalStatus || "pending") === "pending").length,
        approved: recruiters.filter((r) => r.approvalStatus === "approved").length,
        rejected: recruiters.filter((r) => r.approvalStatus === "rejected").length
    };

    const filteredRecruiters = recruiters.filter(
        (r) => (r.approvalStatus || "pending") === filter
    );

    return (
        <div className="p-4">
            <h3 className="fw-bold mb-1">Recruiter Applications</h3>
            <p className="text-muted mb-4">
                Review and manage recruiter registration requests.
            </p>

            <div className="row g-3 mb-4">
                {[
                    { label: "Pending", key: "pending", color: "warning" },
                    { label: "Approved", key: "approved", color: "success" },
                    { label: "Rejected", key: "rejected", color: "danger" }
                ].map((item) => (
                    <div className="col-md-4" key={item.key}>
                        <div className="bg-white rounded-3 shadow-sm border p-3">
                            <h6 className="text-muted">{item.label}</h6>
                            <h2 className="fw-bold mb-0">{counts[item.key]}</h2>
                        </div>
                    </div>
                ))}
            </div>

            <div className="d-flex gap-2 mb-4">
                {["pending", "approved", "rejected"].map((status) => (
                    <Button
                        key={status}
                        variant={filter === status ? "primary" : "outline-primary"}
                        onClick={() => setFilter(status)}
                        className="text-capitalize"
                    >
                        {status}
                    </Button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : filteredRecruiters.length === 0 ? (
                <Alert variant="light" className="border">
                    No {filter} recruiter requests found.
                </Alert>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {filteredRecruiters.map((recruiter) => (
                        <div
                            key={recruiter._id}
                            className="bg-white border rounded-3 shadow-sm p-4"
                        >
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                                <div>
                                    <h5 className="fw-bold mb-1">
                                        {recruiter.fullName}
                                    </h5>
                                    <p className="mb-1">{recruiter.companyName}</p>
                                    <p className="text-muted small mb-1">
                                        {recruiter.email}
                                    </p>
                                    <p className="text-muted small mb-0">
                                        {recruiter.designation}
                                    </p>
                                </div>

                                <Badge
                                    bg={
                                        recruiter.approvalStatus === "approved"
                                            ? "success"
                                            : recruiter.approvalStatus === "rejected"
                                                ? "danger"
                                                : "warning"
                                    }
                                >
                                    {(recruiter.approvalStatus || "pending").toUpperCase()}
                                </Badge>
                            </div>

                            {filter === "pending" && (
                                <div className="d-flex gap-2 justify-content-end flex-wrap mt-3">
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => setSelectedRecruiter(recruiter)}
                                    >
                                        View Profile
                                    </Button>

                                    {recruiter.approvalStatus === "pending" && (
                                        <>
                                            <Button
                                                variant="outline-danger"
                                                disabled={processingId !== null}
                                                onClick={() =>
                                                    handleApproval(recruiter._id, "rejected")
                                                }
                                            >
                                                Reject
                                            </Button>

                                            <Button
                                                variant="success"
                                                disabled={processingId !== null}
                                                onClick={() =>
                                                    handleApproval(recruiter._id, "approved")
                                                }
                                            >
                                                {processingId === recruiter._id
                                                    ? "Processing..."
                                                    : "Approve"}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <Modal
                show={!!selectedRecruiter}
                onHide={() => setSelectedRecruiter(null)}
                size="lg"
                centered
                scrollable
            >
                <Modal.Header closeButton>
                    <Modal.Title>Recruiter Profile</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedRecruiter && (
                        <>
                            <div
                                className="rounded-3 mb-4"
                                style={{
                                    height: 180,
                                    background: selectedRecruiter.companyBanner
                                        ? `url("${selectedRecruiter.companyBanner}") center/cover`
                                        : "#e8efff"
                                }}
                            />

                            <div className="d-flex align-items-center gap-3 mb-4">
                                {selectedRecruiter.companyLogo ? (
                                    <img
                                        src={selectedRecruiter.companyLogo}
                                        alt="Company Logo"
                                        style={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            border: "2px solid #eee"
                                        }}
                                    />
                                ) : (
                                    <div className="bg-light rounded-circle p-4">
                                        No Logo
                                    </div>
                                )}

                                <div>
                                    <h4 className="fw-bold mb-1">
                                        {selectedRecruiter.companyName}
                                    </h4>
                                    <p className="text-muted mb-1">
                                        {selectedRecruiter.industry || "Industry not provided"}
                                    </p>
                                    <Badge
                                        bg={
                                            selectedRecruiter.approvalStatus === "approved"
                                                ? "success"
                                                : selectedRecruiter.approvalStatus === "rejected"
                                                    ? "danger"
                                                    : "warning"
                                        }
                                    >
                                        {selectedRecruiter.approvalStatus}
                                    </Badge>
                                </div>
                            </div>

                            <h5 className="fw-bold mb-3">Recruiter Information</h5>

                            <Row className="g-3 mb-4">
                                <Col md={6}>
                                    <strong>Full Name</strong>
                                    <p>{selectedRecruiter.fullName || "Not provided"}</p>
                                </Col>
                                <Col md={6}>
                                    <strong>User ID</strong>
                                    <p>{selectedRecruiter.userId || "Not provided"}</p>
                                </Col>
                                <Col md={6}>
                                    <strong>Email</strong>
                                    <p>{selectedRecruiter.email || "Not provided"}</p>
                                </Col>
                                <Col md={6}>
                                    <strong>Designation</strong>
                                    <p>{selectedRecruiter.designation || "Not provided"}</p>
                                </Col>
                            </Row>

                            <hr />

                            <h5 className="fw-bold mb-3">Company Information</h5>

                            <Row className="g-3">
                                {[
                                    ["Industry", selectedRecruiter.industry],
                                    ["Location", selectedRecruiter.companyLocation],
                                    ["Company Size", selectedRecruiter.companySize],
                                    ["Founded Year", selectedRecruiter.foundedYear],
                                    ["Phone", selectedRecruiter.companyPhone]
                                ].map(([label, value]) => (
                                    <Col md={6} key={label}>
                                        <strong>{label}</strong>
                                        <p>{value || "Not provided"}</p>
                                    </Col>
                                ))}

                                <Col md={12}>
                                    <strong>Website</strong>
                                    <p>
                                        {selectedRecruiter.companyWebsite ? (
                                            <a
                                                href={selectedRecruiter.companyWebsite}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {selectedRecruiter.companyWebsite}
                                            </a>
                                        ) : "Not provided"}
                                    </p>
                                </Col>

                                <Col md={12}>
                                    <strong>LinkedIn</strong>
                                    <p>
                                        {selectedRecruiter.companyLinkedin ? (
                                            <a
                                                href={selectedRecruiter.companyLinkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {selectedRecruiter.companyLinkedin}
                                            </a>
                                        ) : "Not provided"}
                                    </p>
                                </Col>

                                <Col md={12}>
                                    <strong>About Company</strong>
                                    <p className="text-muted">
                                        {selectedRecruiter.companyDescription ||
                                            "No description provided"}
                                    </p>
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setSelectedRecruiter(null)}
                    >
                        Close
                    </Button>

                    {selectedRecruiter?.approvalStatus === "pending" && (
                        <>
                            <Button
                                variant="outline-danger"
                                disabled={processingId !== null}
                                onClick={async () => {
                                    const id = selectedRecruiter._id;
                                    await handleApproval(id, "rejected");
                                    setSelectedRecruiter(null);
                                }}
                            >
                                Reject
                            </Button>

                            <Button
                                variant="success"
                                disabled={processingId !== null}
                                onClick={async () => {
                                    const id = selectedRecruiter._id;
                                    await handleApproval(id, "approved");
                                    setSelectedRecruiter(null);
                                }}
                            >
                                Approve
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};
