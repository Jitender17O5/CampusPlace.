
import { useEffect, useState } from "react";
import {
    Container,
    Card,
    Table,
    Form,
    Spinner,
    Alert,
    Badge,
    Button,
    Modal
} from "react-bootstrap";

import { FaSearch, FaEye, FaBuilding, FaTrash } from "react-icons/fa";
import { getAllAdminRecruiters, deleteAdminRecruiter } from "../../Api/postApi";
import { toast } from "react-toastify";

export const ManageRecruiters = () => {
    const [recruiters, setRecruiters] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRecruiter, setSelectedRecruiter] = useState(null);
    const [showModal, setShowModal] = useState(false);


    const [recruiterToDelete, setRecruiterToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    useEffect(() => {
        const fetchRecruiters = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getAllAdminRecruiters();

                setRecruiters(response.data.recruiters || []);
            } catch (err) {
                console.error("Fetch recruiters error:", err);

                setError(
                    err.response?.data?.message ||
                    "Failed to fetch recruiters"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRecruiters();
    }, []);

    const filteredRecruiters = recruiters.filter((recruiter) => {
        const query = search.toLowerCase().trim();

        return [
            recruiter.fullName,
            recruiter.email,
            recruiter.companyName,
            recruiter.designation
        ].some((value) =>
            String(value || "").toLowerCase().includes(query)
        );
    });
    const handleView = (recruiter) => {
        setSelectedRecruiter(recruiter);
        setShowModal(true);
    };
    const handleDeleteRecruiter = async () => {
        if (!recruiterToDelete || deleting) return;

        setDeleting(true);

        try {
            await deleteAdminRecruiter(recruiterToDelete._id);

            // Remove deleted recruiter from the table
            setRecruiters((prevRecruiters) =>
                prevRecruiters.filter(
                    (recruiter) => recruiter._id !== recruiterToDelete._id
                )
            );

            toast.success("Recruiter account deleted successfully");

            setRecruiterToDelete(null);
        } catch (error) {
            console.error("Delete recruiter error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to delete recruiter"
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Container fluid className="py-4 px-3 px-lg-4">
            <div className="mb-4">
                <h3 className="fw-bold mb-1">Manage Recruiters</h3>
                <p className="text-muted mb-0">
                    View and manage registered recruiters.
                </p>
            </div>

            <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-3 p-lg-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                        <div>
                            <h5 className="fw-bold mb-1">Registered Recruiters</h5>
                            <p className="text-muted small mb-0">
                                Total: {filteredRecruiters.length}
                            </p>
                        </div>

                        <div className="position-relative">
                            <FaSearch
                                className="position-absolute top-50 translate-middle-y text-muted"
                                style={{ left: "12px" }}
                            />

                            <Form.Control
                                type="search"
                                placeholder="Search recruiters..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    paddingLeft: "36px",
                                    minWidth: "250px"
                                }}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="text-muted mt-3">
                                Loading recruiters...
                            </p>
                        </div>
                    ) : error ? (
                        <Alert variant="danger">{error}</Alert>
                    ) : filteredRecruiters.length === 0 ? (
                        <Alert variant="info">
                            {search
                                ? "No recruiters match your search."
                                : "No registered recruiters found."}
                        </Alert>
                    ) : (
                        <Table responsive hover className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Recruiter</th>
                                    <th>Company</th>
                                    <th>Designation</th>
                                    <th>Location</th>
                                    <th>Registered</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredRecruiters.map((recruiter, index) => (
                                    <tr key={recruiter._id}>
                                        <td>{index + 1}</td>

                                        <td>
                                            <div className="fw-semibold">
                                                {recruiter.fullName}
                                            </div>
                                            <small className="text-muted">
                                                {recruiter.email}
                                            </small>
                                        </td>

                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                {recruiter.companyLogo ? (
                                                    <img
                                                        src={recruiter.companyLogo}
                                                        alt="Company logo"
                                                        width="36"
                                                        height="36"
                                                        style={{
                                                            objectFit: "contain",
                                                            borderRadius: "8px"
                                                        }}
                                                    />
                                                ) : (
                                                    <FaBuilding className="text-primary" />
                                                )}

                                                <span className="fw-medium">
                                                    {recruiter.companyName}
                                                </span>
                                            </div>
                                        </td>

                                        <td>{recruiter.designation || "—"}</td>

                                        <td>{recruiter.companyLocation || "—"}</td>

                                        <td>
                                            {recruiter.createdAt
                                                ? new Date(
                                                    recruiter.createdAt
                                                ).toLocaleDateString("en-IN")
                                                : "—"}
                                        </td>

                                        <td className="text-center">
                                            <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleView(recruiter)}
                                                >
                                                    <FaEye className="me-1" />
                                                    View
                                                </Button>

                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => setRecruiterToDelete(recruiter)}
                                                >
                                                    <FaTrash className="me-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* ================= RECRUITER DETAILS MODAL ================= */}

            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">
                        Recruiter Details
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedRecruiter && (
                        <>
                            {/* Company Banner */}
                            {selectedRecruiter.companyBanner && (
                                <img
                                    src={selectedRecruiter.companyBanner}
                                    alt="Company banner"
                                    className="w-100 rounded-3 mb-3"
                                    style={{
                                        height: "160px",
                                        objectFit: "cover"
                                    }}
                                />
                            )}

                            {/* Company Header */}
                            <div className="d-flex align-items-center gap-3 mb-4">
                                {selectedRecruiter.companyLogo ? (
                                    <img
                                        src={selectedRecruiter.companyLogo}
                                        alt="Company logo"
                                        width="65"
                                        height="65"
                                        className="rounded-3 border p-1"
                                        style={{ objectFit: "contain" }}
                                    />
                                ) : (
                                    <FaBuilding size={40} className="text-primary" />
                                )}

                                <div>
                                    <h5 className="fw-bold mb-1">
                                        {selectedRecruiter.companyName}
                                    </h5>

                                    <p className="text-muted mb-0">
                                        {selectedRecruiter.industry || "Industry not provided"}
                                    </p>
                                </div>
                            </div>

                            <h6 className="fw-bold border-bottom pb-2">
                                Recruiter Information
                            </h6>

                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <strong>Full Name:</strong>
                                    <p>{selectedRecruiter.fullName || "—"}</p>
                                </div>

                                <div className="col-md-6">
                                    <strong>Email:</strong>
                                    <p>{selectedRecruiter.email || "—"}</p>
                                </div>

                                <div className="col-md-6">
                                    <strong>User ID:</strong>
                                    <p>{selectedRecruiter.userId || "—"}</p>
                                </div>

                                <div className="col-md-6">
                                    <strong>Designation:</strong>
                                    <p>{selectedRecruiter.designation || "—"}</p>
                                </div>
                            </div>

                            <h6 className="fw-bold border-bottom pb-2">
                                Company Information
                            </h6>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <strong>Location:</strong>
                                    <p>{selectedRecruiter.companyLocation || "—"}</p>
                                </div>

                                <div className="col-md-6">
                                    <strong>Company Size:</strong>
                                    <p>{selectedRecruiter.companySize || "—"}</p>
                                </div>

                                <div className="col-md-6">
                                    <strong>Founded Year:</strong>
                                    <p>{selectedRecruiter.foundedYear || "—"}</p>
                                </div>

                                <div className="col-md-6">
                                    <strong>Phone:</strong>
                                    <p>{selectedRecruiter.companyPhone || "—"}</p>
                                </div>

                                <div className="col-12">
                                    <strong>Company Description:</strong>
                                    <p className="text-muted">
                                        {selectedRecruiter.companyDescription ||
                                            "No description provided."}
                                    </p>
                                </div>

                                <div className="col-md-6">
                                    <strong>Website:</strong>
                                    <p>
                                        {selectedRecruiter.companyWebsite ? (
                                            <a
                                                href={selectedRecruiter.companyWebsite}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Visit Website
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </p>
                                </div>

                                <div className="col-md-6">
                                    <strong>LinkedIn:</strong>
                                    <p>
                                        {selectedRecruiter.companyLinkedin ? (
                                            <a
                                                href={selectedRecruiter.companyLinkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View LinkedIn
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ================= DELETE RECRUITER MODAL ================= */}

            <Modal
                show={Boolean(recruiterToDelete)}
                onHide={() => {
                    if (!deleting) setRecruiterToDelete(null);
                }}
                centered
                backdrop={deleting ? "static" : true}
                keyboard={!deleting}
            >
                <Modal.Header closeButton={!deleting}>
                    <Modal.Title className="fw-bold">
                        Delete Recruiter
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="text-center py-3">
                        <div
                            className="d-flex align-items-center justify-content-center mx-auto mb-3"
                            style={{
                                width: "65px",
                                height: "65px",
                                borderRadius: "50%",
                                backgroundColor: "#fee2e2",
                                color: "#dc3545"
                            }}
                        >
                            <FaTrash size={25} />
                        </div>

                        <h5 className="fw-bold">Are you sure?</h5>

                        <p className="text-muted mb-2">
                            You are about to deactivate the recruiter account:
                        </p>

                        <h6 className="fw-bold mb-1">
                            {recruiterToDelete?.fullName}
                        </h6>

                        <p className="text-muted">
                            {recruiterToDelete?.companyName}
                        </p>

                        <p className="text-muted small mb-0">
                            This recruiter will no longer be able to log in.
                            Existing jobs and student applications will be preserved.
                        </p>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="light"
                        disabled={deleting}
                        onClick={() => setRecruiterToDelete(null)}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="danger"
                        disabled={deleting}
                        onClick={handleDeleteRecruiter}
                    >
                        {deleting ? (
                            <>
                                <Spinner
                                    animation="border"
                                    size="sm"
                                    className="me-2"
                                />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <FaTrash className="me-2" />
                                Delete Recruiter
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>


        </Container>
    );
};
