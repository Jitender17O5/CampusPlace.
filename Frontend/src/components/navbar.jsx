import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/campusPlace_logo.png";
import "./nav.css";

export function Nave() {
  const location = useLocation();
  const navigate = useNavigate();

  const handler = (action) => {
    navigate("/roleSelection", {
      state: {
        action: action
      }
    });
  };

  const isAuthPage =
    location.pathname === "/roleSelection" ||
    location.pathname === "/register";

  return (
    <Navbar
      expand="lg"
      className="navbar"
      style={{
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e0e7ff",
        backgroundColor: "#ffffff"
      }}
    >
      <Container fluid >

        {/* Logo */}
        <Navbar.Brand as={Link} to="/">
          <img
            src={logo}
            alt="CampusPlace"
            style={{
              width: "300px",
              height: "50px",
              objectFit: "contain",
            }}
          />
        </Navbar.Brand>

        {/* Mobile Toggle */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {!isAuthPage ? (
          <>
            <Navbar.Collapse id="basic-navbar-nav">

              {/* Navigation Links */}
              <Nav className="mx-auto gap-3">

                <Nav.Link
                  as={Link}
                  to="/"
                  className="nav-hover"
                  style={{
                    fontWeight: "500",
                    fontSize: "20px"
                  }}
                >
                  Home
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/jobs"
                  className="nav-hover"
                  style={{
                    fontWeight: "500",
                    fontSize: "20px"
                  }}
                >
                  Jobs
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/about"
                  className="nav-hover"
                  style={{
                    fontWeight: "500",
                    fontSize: "20px"
                  }}
                >
                  About
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/contact"
                  className="nav-hover"
                  style={{
                    fontWeight: "500",
                    fontSize: "20px"
                  }}
                >
                  Contact
                </Nav.Link>

              </Nav>

              {/* Login and Register Buttons */}
              <div className="d-flex gap-3">

                <Button
                  onClick={() => handler("login")}
                  variant="outline-primary"
                  className="loginBtn px-4"
                >
                  Login
                </Button>

                <Button
                  onClick={() => handler("register")}
                  className="registerBtn px-4"
                >
                  SignUp
                </Button>

              </div>

            </Navbar.Collapse>
          </>
        ) : (
          /* Back Button */
          <Button
            style={{ marginRight: "30px" }}
            variant="outline-primary"
            className="loginBtn"
            onClick={() => navigate("/")}
          >
            ← Back
          </Button>
        )}

      </Container>
    </Navbar>
  );
}

export default Nave;
