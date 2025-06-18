import React from "react";
import Navbard from './components/navbard'

const steps = [
  {
    title: "QR Code on Laptop",
    description:
      "Attach a QR code on laptops for support, warranty, or easy device check-in. Quick scan redirects to your device details.",
    img: "/assets/qr2.png",
  },
  {
    title: "QR on Packaging Box",
    description:
      "Stick a QR code on product packaging to let users verify authenticity, view user manuals, or installation videos.",
    img: "/assets/qr1.png",
  },
  {
    title: "QR on Device Back",
    description:
      "Ideal for phones, tablets, and routers. Helps in lost-and-found cases or service requests just by scanning.",
    img: "/assets/qr2.png",
  },
  {
    title: "QR for Business Cards",
    description:
      "Generate digital visiting cards. Scan to save contact, portfolio, or social profile directly from printed cards.",
    img: "/assets/qr4.png",
  },
];

const FlowTheStep = () => {
  return (
    <>
      {/* Header */}
         <Navbard/>
    
      {/* Main Content */}
      <div style={{ backgroundColor: "#fff", color: "#333", fontFamily: "sans-serif" }}>
        <div className="container py-5">
          <h1 className="text-center fw-bold mb-5" style={{ color: "#ff6600", fontSize: "2rem" }}>
            How to Use QR Codes on Your Devices
          </h1>

          {steps.map((step, index) => (
            <div
              className={`row align-items-center gy-4 mb-5 ${
                index % 2 !== 0 ? "flex-md-row-reverse" : ""
              }`}
              key={index}
            >
              {/* Image Column */}
              <div className="col-12 col-md-6 text-center">
                <img
                  src={step.img}
                  alt={step.title}
                  className="img-fluid rounded "
                  style={{ maxWidth: "180px",   }}
                />
              </div>

              {/* Text Column */}
              <div className="col-12 col-md-6 text-center text-md-start">
                <h3 className="fw-semibold mb-2" style={{ color: "#ff6600" }}>
                  {step.title}
                </h3>
                <p className="mx-auto" style={{ maxWidth: "500px" }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}

         
        </div>

        {/* Divider */}
        <div
          style={{
            height: "10px",
            backgroundImage: "radial-gradient(#ff6600 1px, transparent 1px)",
            backgroundSize: "10px 10px",
            margin: "40px 0",
          }}
        />

        {/* Footer */}
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
                  <a href="#" className="text-decoration-none text-muted">
                    Terms of Use
                  </a>
                </li>
                <li>
                  <a href="#" className="text-decoration-none text-muted">
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
      </div>
    </>
  );
};

export default FlowTheStep;
