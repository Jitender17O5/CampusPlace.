
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BiBuildings } from "react-icons/bi";
import { PiStudentFill } from "react-icons/pi";
import { GoShieldCheck } from "react-icons/go";
import { FiUserCheck } from "react-icons/fi";

import imag from "../../assets/bg imh.png";

export function HeroSection() {
    const navigate=useNavigate()
    return (
        <Container fluid style={{ backgroundColor: "#f5f3ff" }} className="py-5">
            <Row className="h-screen">
                <Col className="d-flex justify-content-space align-items-center m-5 mt-2">
                    <div className="mt-4">
                        <h1 className="hero-title">
                            Your Placement Journey <br />
                            <span>Starts Here.</span>
                        </h1>

                        <p className="hero-description">
                            A smart platform connecting talented students with
                            top recruiters and companies.
                        </p>

                        <div className="py-2">
                            <Button
                                className="px-4 py-2 fw-semibold"
                                style={{
                                    background: "linear-gradient(135deg, #4f46e5, #2563eb)",
                                    border: "none",
                                    borderRadius: "8px"
                                }}
                                onClick={() =>
                                    navigate("/roleSelection", {
                                        state: { action: "register" }
                                    })
                                }
                            >
                                Get Started
                            </Button>

                            <Button
                                variant="outline-primary"
                                 onClick={() => navigate("/about")}
                                className="px-4 py-2 fw-semibold"
                                style={{
                                    borderRadius: "8px",
                                    marginLeft: "20px"
                                }}
                            >
                                Learn More
                            </Button>
                        </div>

                        <div
                            style={{ marginTop: "80px" }}
                            className="hero-stats"
                        >
                            <div className="stat-item">
                                <div className="stats-icon companies-stat">
                                    <BiBuildings size={30} />
                                </div>
                                <div>
                                    <h3 className="mb-0 fw-bold">500+</h3>
                                    <p className="mb-0">Companies</p>
                                </div>
                            </div>

                            <div className="stat-divider"></div>

                            <div className="stat-item">
                                <div className="stats-icon students-stat">
                                    <PiStudentFill size={30} />
                                </div>
                                <div>
                                    <h3 className="mb-0 fw-bold">10K+</h3>
                                    <p className="mb-0">Students</p>
                                </div>
                            </div>

                            <div className="stat-divider"></div>

                            <div className="stat-item">
                                <div className="stats-icon jobs-stat">
                                    <GoShieldCheck size={30} />
                                </div>
                                <div>
                                    <h3 className="mb-0 fw-bold">2K+</h3>
                                    <p className="mb-0">Job Opportunities</p>
                                </div>
                            </div>

                            <div className="stat-divider"></div>

                            <div className="stat-item">
                                <div className="stats-icon placement-stat">
                                    <FiUserCheck size={30} />
                                </div>
                                <div>
                                    <h3 className="mb-0 fw-bold">100%</h3>
                                    <p className="mb-0">Placement Rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>

                <Col className="d-flex justify-content-center align-items-center">
                    <div>
                        <img
                            src={imag}
                            alt="Campus placement"
                            height={550}
                            width={660}
                            style={{ borderRadius: "2rem" }}
                        />
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
