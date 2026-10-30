
import { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    Form,
    Button,
    Spinner,
    Alert,
    Badge,
    Modal
} from "react-bootstrap";
import { FaSearch, FaEye, FaTrash, FaUserGraduate } from "react-icons/fa";
import { toast } from "react-toastify";

// import { FaSearch, FaEye, FaUserGraduate } from "react-icons/fa";
import { getAllAdminStudents, deleteAdminStudent } from "../../Api/postApi";
// import "./manageStudents.css";
import "./manageStudent.css"

export const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);


    useEffect(() => {
        let active = true;

        const fetchStudents = async () => {
            try {
                const response = await getAllAdminStudents();

                if (active) {
                    setStudents(response.data.students || []);
                    setError("");
                }
            } catch (err) {
                console.error("Fetch students error:", err);

                if (active) {
                    setError("Failed to load students.");
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchStudents();

        return () => {
            active = false;
        };
    }, []);

    // Search by name, email, roll number, course or college
    const filteredStudents = students.filter((student) => {
        const query = search.toLowerCase().trim();

        return [
            student.fullName,
            student.collegeEmail,
            student.rollNo,
            student.course,
            student.college
        ].some((value) =>
            String(value ?? "").toLowerCase().includes(query)
        );
    });

    const handleView = (student) => {
        setSelectedStudent(student);
        setShowModal(true);
    };
    const handleDeleteStudent = async () => {
        if (!studentToDelete || deleting) return;

        setDeleting(true);

        try {
            await deleteAdminStudent(studentToDelete._id);

            setStudents((prevStudents) =>
                prevStudents.filter(
                    (student) => student._id !== studentToDelete._id
                )
            );

            toast.success("Student account deleted successfully");

            setStudentToDelete(null);
        } catch (error) {
            console.error("Delete student error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to delete student"
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Container fluid className="p-0">

            {/* Page Heading */}
            <div className="mb-4">
                <h2 className="fw-bold mb-2">Manage Students</h2>
                <p className="text-muted">
                    View and manage registered students on CampusPlace.
                </p>
            </div>

            {/* Summary Card */}
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4">
                            <FaUserGraduate
                                size={28}
                                className="text-primary mb-3"
                            />
                            <h6 className="text-muted">Total Students</h6>

                            <h2 className="fw-bold mb-0">
                                {loading ? (
                                    <Spinner animation="border" size="sm" />
                                ) : error ? "—" : students.length}
                            </h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Students Table */}
            <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">

                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                        <h5 className="fw-bold mb-0">Registered Students</h5>

                        <div className="position-relative">
                            <FaSearch
                                className="position-absolute text-muted"
                                style={{
                                    left: "14px",
                                    top: "50%",
                                    transform: "translateY(-50%)"
                                }}
                            />

                            <Form.Control
                                type="search"
                                placeholder="Search students..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    paddingLeft: "40px",
                                    minWidth: "260px"
                                }}
                            />
                        </div>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="text-muted mt-3">
                                Loading students...
                            </p>
                        </div>
                    ) : (

                        <Table
                            responsive
                            hover
                            className="admin-students-table align-middle mb-0"
                        >
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student Name</th>
                                    <th>Email</th>
                                    <th>Roll No.</th>
                                    <th>Course</th>
                                    <th>College</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student, index) => (
                                        <tr key={student._id}>
                                            <td className="text-muted">{index + 1}</td>

                                            <td>
                                                <div className="student-name-cell">
                                                    <div className="student-avatar">
                                                        {student.fullName?.charAt(0).toUpperCase() || "S"}
                                                    </div>

                                                    <span className="student-name">
                                                        {student.fullName || "—"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="student-email">
                                                    {student.collegeEmail || "—"}
                                                </span>
                                            </td>

                                            <td>{student.rollNo || "—"}</td>

                                            <td>
                                                <Badge className="student-course-badge">
                                                    {student.course || "N/A"}
                                                </Badge>
                                            </td>

                                            <td>
                                                <div
                                                    className="student-college-text"
                                                    title={student.college || ""}
                                                >
                                                    {student.college || "—"}
                                                </div>
                                            </td>

                                            <td>
                                                <div className="student-actions">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="student-view-btn"
                                                        onClick={() => handleView(student)}
                                                    >
                                                        <FaEye />
                                                        <span>View</span>
                                                    </Button>

                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className="student-delete-btn"
                                                        onClick={() => setStudentToDelete(student)}
                                                    >
                                                        <FaTrash />
                                                        <span>Delete</span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center text-muted py-5">
                                            {search
                                                ? "No matching students found."
                                                : "No students registered yet."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>

                    )}

                    {!loading && !error && (
                        <p className="text-muted small mb-0">
                            Showing {filteredStudents.length} of {students.length} students
                        </p>
                    )}

                </Card.Body>
            </Card>

            {/* Student Details Modal */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Student Details</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedStudent && (
                        <Row className="g-3">
                            {[
                                ["Full Name", selectedStudent.fullName],
                                ["Email", selectedStudent.collegeEmail],
                                ["Roll Number", selectedStudent.rollNo],
                                ["Phone", selectedStudent.phone],
                                ["Course", selectedStudent.course],
                                ["College", selectedStudent.college],
                                ["CGPA", selectedStudent.cgpa],
                                ["Address", selectedStudent.address]
                            ].map(([label, value]) => (
                                <Col md={6} key={label}>
                                    <div className="text-muted small">{label}</div>
                                    <div className="fw-semibold">
                                        {value ?? "Not provided"}
                                    </div>
                                </Col>
                            ))}

                            <Col xs={12}>
                                <div className="text-muted small mb-2">Skills</div>

                                {selectedStudent.skills?.length > 0 ? (
                                    selectedStudent.skills.map((skill, index) => (
                                        <Badge
                                            bg="light"
                                            text="dark"
                                            className="border me-2 mb-2"
                                            key={index}
                                        >
                                            {skill}
                                        </Badge>
                                    ))
                                ) : (
                                    <span>Not provided</span>
                                )}
                            </Col>
                        </Row>
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

            {/* ================= DELETE CONFIRMATION ================= */}

            <Modal
                show={Boolean(studentToDelete)}
                onHide={() => {
                    if (!deleting) setStudentToDelete(null);
                }}
                centered
            >
                <Modal.Header closeButton={!deleting}>
                    <Modal.Title className="fw-bold">
                        Delete Student
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="text-center py-3">
                        <div className="student-delete-icon mx-auto mb-3">
                            <FaTrash size={25} />
                        </div>

                        <h5 className="fw-bold">
                            Are you sure?
                        </h5>

                        <p className="text-muted mb-2">
                            You are about to delete the account of
                        </p>

                        <h6 className="fw-bold">
                            {studentToDelete?.fullName}
                        </h6>

                        <p className="text-muted small mt-3 mb-0">
                            This account will be deactivated and the student
                            will no longer be able to log in.
                            Existing job applications will be preserved.
                        </p>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="light"
                        disabled={deleting}
                        onClick={() => setStudentToDelete(null)}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="danger"
                        disabled={deleting}
                        onClick={handleDeleteStudent}
                    >
                        {deleting ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <FaTrash className="me-2" />
                                Delete Student
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>


        </Container>
    );
};
