
import { Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
export function PlacementCTA() {
    const navigate = useNavigate()

    return (
        <section className="p-4">
            <Row className="cta-section p-4 rounded-3 align-items-center">

                <Col lg={7}>
                    <h5 className="cta-label">
                        TAKE THE NEXT STEP
                    </h5>

                    <h1 className="cta-title">
                        Ready to Start Your Placement Journey?
                    </h1>

                    <p className="cta-description">
                        Join thousands of students and get access to
                        top companies, real opportunities and a bright future.
                    </p>
                </Col>

                <Col lg={5}>
                    <div className="d-flex gap-3 justify-content-lg-center mt-4 mt-lg-0">

                        <Button className="cta-primary-btn"
                            onClick={() =>
                                navigate("/roleSelection", {
                                    state: { action: "register" }
                                })
                            }>
                            Create Account
                        </Button>

                        <Button className="cta-secondary-btn"
                            onClick={() => navigate("/about")}>
                            Learn More
                        </Button>

                    </div>
                </Col>

            </Row>
        </section>
    );
}
