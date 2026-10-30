import { Container, Button, Col, Row } from "react-bootstrap";
import contactimage from "../../assets/contactimage.png";
import "./index.css";

import { IoPersonSharp, IoDiamond } from "react-icons/io5";
import { MdWorkOutline, MdOutlinePeopleAlt } from "react-icons/md";
import { GrUserSettings } from "react-icons/gr";
import { GoGoal } from "react-icons/go";
import { FaEye } from "react-icons/fa";
import { BsStack } from "react-icons/bs";
import { ImPower } from "react-icons/im";
import { AiOutlineSafetyCertificate } from "react-icons/ai";

import { Cards } from "./Cards";
import { useNavigate } from "react-router-dom";

export const About = () => {
  const navigate=useNavigate()
  return (
    <div className="about-page">

      {/* ================= HERO ================= */}
      <section className="about-hero">
        <Container>
          <Row className="align-items-center">

            <Col lg={5}>
              <p className="about-label">ABOUT US</p>

              <h1 className="about-title">
                Bridging Talent <br />
                with <span>Opportunity</span>
              </h1>

              <p className="about-description">
                CampusPlace is a dedicated campus placement portal that
                connects students, recruiters, and placement officers on a
                single platform to make hiring simpler, faster, and more
                transparent.
              </p>

              <Button className="mission-btn">
                Our Mission <span>→</span>
              </Button>
            </Col>

            <Col lg={7}>
              <img
                src={contactimage}
                alt="CampusPlace"
                className="hero-about-image"
              />
            </Col>

          </Row>
        </Container>
      </section>


      {/* ================= USER CARDS ================= */}
      <Container className="user-section">
        <div className="four-card-grid">

          <Cards
            icon={<IoPersonSharp size={27} />}
            h="For Students"
            desc="Discover job opportunities, apply easily and track your progress."
          />

          <Cards
            icon={<MdWorkOutline size={28} />}
            h="For Recruiters"
            desc="Post jobs, find the right talent and manage applications effortlessly."
          />

          <Cards
            icon={<GrUserSettings size={28} />}
            h="For Placement Officers"
            desc="Organize drives, manage data and ensure a smooth process."
          />

          <Cards
            icon={<MdOutlinePeopleAlt size={30} />}
            h="For Institutions"
            desc="Improve placement outcomes and build stronger industry connections."
          />

        </div>
      </Container>


      {/* ================= STORY ================= */}
      <Container className="story-section">

        <Row className="align-items-center g-4">

          <Col lg={4}>
            <div className="story-image">
              <img
                src="https://images.unsplash.com/photo-1564981797816-1043664bf78d"
                alt="Campus"
              />

              <div className="story-image-text">
                Empowering <br />
                Students for <br />
                a Brighter Future
                <div className="small-line"></div>
              </div>
            </div>
          </Col>


          <Col lg={4}>
            <div className="story-content">

              <h2>Our Story</h2>

              <p>
                CampusPlace was built with a simple goal – to digitalize and
                streamline campus placements. We recognized the challenges
                faced by students, recruiters and placement officers due to
                manual processes, scattered information and lack of real-time
                updates. Our platform brings everything together in one place,
                making the placement process efficient, transparent and
                accessible for everyone.
              </p>

            </div>
          </Col>


          {/* Statistics */}

          <Col lg={4}>
            <div className="stats-box">

              <h6>Together Towards a Brighter Tomorrow</h6>

              <div className="stats-grid">

                <div className="stat">
                  <h2>500+</h2>
                  <p>Companies<br />Onboarded</p>
                </div>

                <div className="stat">
                  <h2>10K+</h2>
                  <p>Students<br />Registered</p>
                </div>

                <div className="stat">
                  <h2>2K+</h2>
                  <p>Job<br />Opportunities</p>
                </div>

                <div className="stat">
                  <h2>90%</h2>
                  <p>Placement<br />Rate</p>
                </div>

              </div>

            </div>
          </Col>

        </Row>
      </Container>


      {/* ================= MISSION / VISION / VALUES ================= */}

      <Container className="mission-section">

        <div className="three-card-grid">

          <Cards
            icon={<GoGoal size={29} />}
            h="Our Mission"
            desc="To create a seamless platform that empowers students, helps recruiters find the right talent, and enables placement officers to manage the process efficiently."
          />

          <Cards
            icon={<FaEye size={29} />}
            h="Our Vision"
            desc="To become a leading campus placement platform that bridges the gap between academic learning and professional opportunities."
          />

          <Cards
            icon={<IoDiamond size={27} />}
            h="Our Values"
            desc="Transparency, Inclusivity, Continuous Improvement and a Student-First Approach drive everything we do at CampusPlace."
          />

        </div>

      </Container>


      {/* ================= WHY CHOOSE ================= */}

      <Container className="why-section">

        <h2>
          Why Choose <span>CampusPlace?</span>
        </h2>

        <div className="why-grid">

          <Cards
            variant="why"
            icon={<BsStack size={28} />}
            h="All-in-One Platform"
            desc="For students, recruiters and placement officers"
          />

          <Cards
            variant="why"
            icon={<ImPower size={28} />}
            h="Real-time Updates"
            desc="Get instant notifications and track progress"
          />

          <Cards
            variant="why"
            icon={<AiOutlineSafetyCertificate size={30} />}
            h="Verified Opportunities"
            desc="Legit job postings from trusted companies"
          />

          <Cards
            variant="why"
            icon={<IoPersonSharp size={28} />}
            h="Easy and User Friendly"
            desc="Simple interface for a smooth experience"
          />

        </div>

      </Container>


      {/* ================= CTA ================= */}

      <Container className="cta-container">

        <div className="community-banner">

          <div>
            <h4>Be a Part of Our Growing Community</h4>

            <p>
              Join CampusPlace and take the next step towards a brighter future.
            </p>
          </div>

          <Button className="get-started-btn"
            onClick={() =>
              navigate("/roleSelection", {
                state: { action: "register" }
              })
            }>
            Get Started <span>→</span>
          </Button>

        </div>

      </Container>

    </div>
  );
};