
import { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

import {
  BsLinkedin,
  BsInstagram,
  BsTwitterX,
} from "react-icons/bs";

import { FaGithub, FaArrowRight } from "react-icons/fa";
import { FiMail, FiMapPin } from "react-icons/fi";

import icon from "../../assets/campusPlace_icon.png";
import "./index.css";

export const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();

    // Newsletter backend API will be connected here.
    // Do not clear the email until subscription succeeds.
  };

  return (
    <footer className="campus-footer">

      {/* ================= MAIN FOOTER ================= */}
      <Container fluid className="px-4 px-lg-5">
        <div className="footer-main">
          <Row className="gy-4 gx-4">

            {/* ================= BRAND ================= */}
            <Col lg={3} md={6}>
              <Link to="/" className="footer-brand">
                <div className="footer-logo-wrapper">
                  <img
                    src={icon}
                    alt="Campus Place Logo"
                    className="footer-logo-img"
                  />
                </div>

                <span className="footer-brand-name">
                  Campus<span>Place</span>
                </span>
              </Link>

              <p className="footer-description mt-3">
                Bridging the gap between talented students
                and leading recruiters. Discover opportunities,
                build careers, and grow together.
              </p>

              <div className="footer-social">
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <BsLinkedin />
                </a>

                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <BsInstagram />
                </a>

                <a
                  href="https://x.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                >
                  <BsTwitterX />
                </a>

                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <FaGithub />
                </a>
              </div>
            </Col>

            {/* ================= QUICK LINKS ================= */}
            <Col lg={2} md={6} sm={6} xs={6}>
              <h5 className="footer-header">
                Quick Links
              </h5>

              <div className="footer-links">
                <Link to="/">
                  Home
                </Link>

                <Link to="/jobs">
                  Browse Jobs
                </Link>

                <Link to="/about">
                  About Us
                </Link>

                <Link to="/contact">
                  Contact Us
                </Link>
              </div>
            </Col>

            {/* ================= STUDENTS ================= */}
            <Col lg={2} md={6} sm={6} xs={6}>
              <h5 className="footer-header">
                For Students
              </h5>

              <div className="footer-links">
                <Link to="/studentSignup">
                  Create Account
                </Link>

                <Link
                  to="/roleSelection"
                  state={{
                    action: "login",
                    role: "student",
                  }}
                >
                  Student Login
                </Link>

                <Link to="/studentDashboard">
                  Dashboard
                </Link>

                <Link to="/jobs">
                  Find Jobs
                </Link>
              </div>
            </Col>

            {/* ================= RECRUITERS ================= */}
            <Col lg={2} md={6} sm={6} xs={6}>
              <h5 className="footer-header">
                For Recruiters
              </h5>

              <div className="footer-links">
                <Link to="/recruiterSignup">
                  Create Account
                </Link>

                <Link
                  to="/roleSelection"
                  state={{
                    action: "login",
                    role: "recruiter",
                  }}
                >
                  Recruiter Login
                </Link>

                <Link to="/recruiterDashboard/post-job">
                  Post a Job
                </Link>

                <Link to="/recruiterDashboard">
                  Dashboard
                </Link>
              </div>
            </Col>

            {/* ================= NEWSLETTER ================= */}
            <Col lg={3} md={6} sm={12}>
              <h5 className="footer-header">
                Stay Updated
              </h5>

              <p className="footer-description">
                Get the latest job openings, internships,
                and career insights delivered to your inbox.
              </p>

              <Form
                onSubmit={handleSubscribe}
                className="footer-newsletter"
              >
                <div className="footer-input-wrapper">
                  <FiMail className="footer-input-icon" />

                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                    aria-label="Newsletter email"
                  />
                </div>

                <Button
                  type="submit"
                  className="footer-subscribe-btn"
                >
                  Subscribe Now
                  <FaArrowRight />
                </Button>
              </Form>

              <p className="footer-newsletter-note">
                Career updates, without the spam.
              </p>
            </Col>

          </Row>
        </div>

        {/* ================= BOTTOM FOOTER ================= */}
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Campus Place.
            All rights reserved.
          </p>

          <div className="footer-bottom-center">
            <FiMapPin />
            <span>
              Made for future professionals
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
};
