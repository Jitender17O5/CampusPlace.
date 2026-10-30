import { Container, Row, Col, Button } from "react-bootstrap"
import aboutimage from "../../assets/aboutimage.png"
import { ShowInfo } from "./infoCard"
import { MdOutlineMailOutline } from "react-icons/md";
import { FiPhoneCall } from "react-icons/fi";
import { LuMapPin } from "react-icons/lu";
import "./index.css"
import { ImLinkedin } from "react-icons/im";
import { FaInstagram } from "react-icons/fa6";
import { FaTwitterSquare } from "react-icons/fa";
import { IoLogoYoutube } from "react-icons/io5";
import { useState } from "react";
import { toast } from "react-toastify";
import { Icons } from "./icons";
import { submitContactMessage } from "../../Api/postApi";
export function Contact() {

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      const response = await submitContactMessage(formData);

      if (response.data.success) {
        toast.success(response.data.message);

        setFormData({
          fullName: "",
          email: "",
          subject: "",
          message: ""
        });
      }
    } catch (error) {
      console.error("Full Error:", error);
      console.log("Error Message:", error.message);
      console.log("Error Code:", error.code);
      console.log("Request URL:", error.config?.url);
      console.log("Base URL:", error.config?.baseURL);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to send message"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Container className="contact-page mt-5 mb-2" fluid  >
        <Row className="align-items-center g-5 px-5">

          {/* Left Content */}
          <Col xs={12} lg={6}>
            <div>
              <p className="contact-small-heading">
                CONTACT US
              </p>

              <h1 className="display-3 fw-bold mb-2 contact-title">
                Get in <span>Touch</span>
              </h1>

              <h3 className="fw-bold mb-3">
                We'd love to hear from you.
              </h3>

              <p className="contact-description">
                Have questions about CampusPlace? Send us a message
                <br className="d-none d-md-block" />
                and our team will get back to you as soon as possible.
              </p>
            </div>
          </Col>

          {/* Right Image */}
          <Col
            xs={12}
            lg={6}
            className="d-flex justify-content-center justify-content-lg-end"
          >
            <img
              src={aboutimage}
              alt="CampusPlace contact"
              className="img-fluid w-100"
              style={{
                height: "20rem",
                maxWidth: "100%",

              }}
            />
          </Col>

        </Row>
        <Row >
          <Col>
            <div className="mb-2 pt-2 px-5">
              <h1 className="fw-bold  fs-1 ">Contact information</h1>
              <p className="fs-4">Reach out to us through any of the following channels. </p>
              <div >
                <ShowInfo icon={<MdOutlineMailOutline size={30} />} h="Email Us" desc="For general inquaries and support" con="support@campusplace.com" />
                <ShowInfo icon={<FiPhoneCall size={30} />} h="Call Us" desc="Mon-fri, 9:00 AM - 6:00 Pm" con="+91 9876543210" />
                <ShowInfo icon={<LuMapPin size={30} />} h="Our Location" desc="Haryana, India" con="CampusPlace HQ" />
              </div>
              <h3>Connect with Us</h3>
              <p className="fs-4">Follow us for updates and opportunities</p>
              <div className="d-flex align-items-center gap-3">
                <Icons icon={<ImLinkedin size={20} />} />
                <Icons icon={<FaInstagram size={20} />} />
                <Icons icon={<FaTwitterSquare size={20} />} />
                <Icons icon={<IoLogoYoutube size={20} />} />
              </div>
            </div>
          </Col>
          <Col>
            <div className="contact-form-card mt-5">
              <h2 className="fw-bold">Send us a Message</h2>

              <p className="text-secondary mb-4">
                Fill out the form below and we'll get back to you.
              </p>


              <form onSubmit={handleSubmit}>

                {/* Name + Email */}
                <Row className="g-3 mb-3">
                  <Col md={6}>
                    <label className="label mb-2">Full Name</label>

                    <input
                      className="input"
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </Col>

                  <Col md={6}>
                    <label className="label mb-2">Email Address</label>

                    <input
                      className="input"
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                </Row>

                {/* Subject */}
                <Row className="mb-3">
                  <Col>
                    <label className="label mb-2">Subject</label>

                    <input
                      className="input"
                      type="text"
                      name="subject"
                      placeholder="Enter subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                </Row>

                {/* Message */}
                <Row className="mb-4">
                  <Col>
                    <label className="label mb-2">Message</label>

                    <textarea
                      className="input message-input"
                      name="message"
                      placeholder="Type your message here"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                </Row>

                <Button
                  type="submit"
                  className="send-message-btn w-100 border-0 fw-semibold"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Message →"}
                </Button>

              </form>

            </div>
          </Col>
        </Row>
      </Container>
    </>
  )
}