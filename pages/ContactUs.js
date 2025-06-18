import { useRouter } from "next/router";
import React, { useState } from "react";
import { FaUser, FaCalendarAlt, FaBuilding, FaPhoneAlt, FaBoxes } from "react-icons/fa";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Image,
  Spinner,
} from "react-bootstrap";
import Swal from "sweetalert2";
import Navbard from './components/navbard'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    assets: "",
    organization: "",
    mobile: "",
  });

  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const iconStyle = {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#FFA726",
    fontSize: "14px",
    zIndex: 2,
  };
  
  const inputStyle = {
    paddingLeft: "32px", // enough space to make room for icon
    borderRadius: "50px",
  };
   

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.assets) newErrors.assets = "Please select asset range";
    if (!formData.organization.trim())
      newErrors.organization = "Organization is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile))
      newErrors.mobile = "Enter valid 10-digit number";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/admin/contactUs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          submission_date: formData.date,
          no_of_assets: formData.assets,
          organization: formData.organization,
          mobile: formData.mobile,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          "Thank you for contacting us! We'll get back to you soon."
        );
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Thank you for contacting us! We'll get back to you soon.",
          confirmButtonColor: "#3085d6",
        });
        setFormData({
          name: "",
          date: "",
          assets: "",
          organization: "",
          mobile: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "An error occurred.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Submission Error:", error);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Something went wrong. Please try again later.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
    <Navbard/>
    
    <Container className="py-5">
  <Row
    className="justify-content-center align-items-stretch shadow rounded overflow-hidden border border-warning"
    style={{ minHeight: "460px" }}
  >
    {/* Left Image Column */}
    <Col md={6} className="d-none d-md-flex bg-white p-0 align-items-center justify-content-center">
      <Image
        src="/assets/Lost.png"
        alt="Contact Illustration"
        width={390}
        height={290}
        style={{ objectFit: "contain" }}
      />
    </Col>

    {/* Right Form Column */}
    <Col md={6} className="bg-white p-4 d-flex flex-column justify-content-center">
      <h4 className="text-warning text-center mb-4">Send Us A Message</h4>
      <Form onSubmit={handleSubmit} noValidate>
        {successMessage && (
          <div className="alert alert-success text-center" role="alert">
            {successMessage}
          </div>
        )}

        <Form.Group controlId="name" className="mb-3 position-relative">
          <FaUser style={iconStyle} />
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            isInvalid={!!errors.name}
            style={inputStyle}
          />
          <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="date" className="mb-3 position-relative">
          <FaCalendarAlt style={iconStyle} />
          <Form.Control
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            isInvalid={!!errors.date}
            style={inputStyle}
          />
          <Form.Control.Feedback type="invalid">{errors.date}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="assets" className="mb-3 position-relative">
          <FaBoxes style={iconStyle} />
          <Form.Select
            name="assets"
            value={formData.assets}
            onChange={handleChange}
            isInvalid={!!errors.assets}
            style={inputStyle}
          >
            <option value="">No. of Assets</option>
            <option value="upto 100">Up to 100</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
            <option value="more than 1000">More than 1000</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.assets}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="organization" className="mb-3 position-relative">
          <FaBuilding style={iconStyle} />
          <Form.Control
            type="text"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            placeholder="Organization Name"
            isInvalid={!!errors.organization}
            style={inputStyle}
          />
          <Form.Control.Feedback type="invalid">{errors.organization}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="mobile" className="mb-4 position-relative">
          <FaPhoneAlt style={iconStyle} />
          <Form.Control
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Mobile Number"
            pattern="[0-9]{10}"
            isInvalid={!!errors.mobile}
            style={inputStyle}
          />
          <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
        </Form.Group>

        <div className="d-flex justify-content-end gap-2">
          <Button
            variant="outline-dark"
            type="reset"
            onClick={() => {
              setFormData({
                name: "",
                date: "",
                assets: "",
                organization: "",
                mobile: "",
              });
              router.push("/");
            }}
          >
            Cancel
          </Button>
          <Button variant="warning" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" /> Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </Form>
    </Col>
  </Row>
</Container>

    <footer
        className="footer-section text-white pt-5"
        style={{
          backgroundColor: "#2f3a4b",
          position: "relative",
          clipPath: "polygon(0 5%, 100% 0%, 100% 100%, 0% 100%)",
        }}
      >
        <div className="container pb-5">
          {/* Top CTA Row */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center py-4">
            <h4 className="fw-bold text-white mb-3 mb-md-0">
              Join our community by using our <br className="d-md-none" />
              smart QR services to secure your items.
            </h4>
            <button className="btn btn-warning rounded-pill px-4 py-2 fw-semibold shadow-sm">
              Try It For Free
            </button>
          </div>

          <hr className="border-light opacity-25" />

          {/* Main Footer Grid */}
          <div className="row pt-4">
            {/* Branding */}
            <div className="col-md-3 mb-4">
              <h5 className="fw-bold text-white mb-3">Qritagya</h5>
              <p className="text-muted small">
                © {new Date().getFullYear()} Qritagya. All rights reserved.
              </p>
              <div className="d-flex gap-3">
                <i className="bi bi-twitter text-white"></i>
                <i className="bi bi-instagram text-white"></i>
                <i className="bi bi-facebook text-white"></i>
                <i className="bi bi-youtube text-white"></i>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-md-3 mb-4">
              <h6 className="fw-bold text-white mb-3">Get in Touch</h6>
              <p className="text-muted small mb-1">
                14/05 Secure Plaza, Delhi, India
              </p>
              <p className="text-muted small mb-1">support@qritagya.com</p>
              <p className="text-muted small">+91 98765 43210</p>
            </div>

            {/* Navigation Links */}
            <div className="col-md-3 mb-4">
              <h6 className="fw-bold text-white mb-3">Explore</h6>
              <ul className="list-unstyled text-muted small">
                <li className="mb-1">
                  <a href="#" className="text-decoration-none text-muted">
                    How It Works
                  </a>
                </li>
                <li className="mb-1">
                  <a href="#" className="text-decoration-none text-muted">
                    Pricing
                  </a>
                </li>
                <li className="mb-1">
                  <a href="/terms-of-use" className="text-decoration-none text-muted">
                    Terms of Use
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="text-decoration-none text-muted">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-md-3">
              <h6 className="fw-bold text-white mb-3">Stay Updated</h6>
              <p className="text-muted small">
                Subscribe to receive item recovery tips and QR tech news.
              </p>
              <div className="input-group">
                <input
                  type="email"
                  className="form-control bg-dark border-0 text-white"
                  placeholder="Email Address"
                />
                <button className="btn btn-warning">Join</button>
              </div>
            </div>
          </div>
        </div>

        {/* Bootstrap Icon CDN */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
        />
      </footer>
    </>
  );
};

export default ContactPage;
