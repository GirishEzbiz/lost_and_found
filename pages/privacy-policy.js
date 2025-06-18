import React from "react";
import Navbard from './components/navbard';

const PrivacyPolicy = () => {
  return (
    <>
      <Navbard />

      <div style={{ backgroundColor: "#fff", fontFamily: "sans-serif" }}>
        {/* Hero Section */}
        <div className="container py-5">
          <div className="text-center mb-5">
            <h1 className="fw-bold" style={{ color: "#a22191" }}>Privacy Policy</h1>
            <p style={{ maxWidth: "650px", margin: "0 auto", fontSize: "16.5px", color: "#555" }}>
              This Privacy Policy explains how Qritigya collects, uses, and protects your
              information when you use our platform. We’re committed to safeguarding your data.
            </p>
          </div>

          <div className="row align-items-center g-4">
            {/* Left Image */}
            <div className="col-md-5 text-center">
              <img
                src="/assets/privacy.png"
                alt="Privacy Illustration"
                className="img-fluid rounded "
                style={{
                  maxWidth: "50%",
             
                   
                }}
              />
            </div>

            {/* Right Summary */}
            <div className="col-md-7 text-center text-md-start d-flex flex-column justify-content-center">
              <h5 className="fw-semibold mb-3" style={{ color: "#a22191" }}>
                Your Trust, Our Priority
              </h5>
              <p style={{ fontSize: "16.5px", lineHeight: "1.8", color: "#444" }}>
                At Qritigya, we value your privacy. This document details the data we collect,
                why we collect it, and how we protect it. You have full control over your information.
              </p>
            </div>
          </div>
        </div>

        {/* Full-width Policy Sections */}
        <div className="container-fluid px-0">
  {[
    {
      title: "1. Information We Collect",
      desc: "We collect information you provide when you register, such as name, email, phone number, and any item details linked via QR codes.",
    },
    {
      title: "2. How We Use Information",
      desc: "Your data helps us connect lost items with their rightful owners. We may also use anonymized data for improving platform performance.",
    },
    {
      title: "3. Data Security",
      desc: "Qritigya uses secure protocols and data encryption to keep your information safe. We never sell or rent your data to third parties.",
    },
    {
      title: "4. User Control",
      desc: "You can access, update, or delete your data anytime by logging into your dashboard.",
    },
    {
      title: "5. Changes to This Policy",
      desc: "Qritigya may update this policy occasionally. We'll notify users of any significant changes via email or dashboard alerts.",
    },
  ].map((item, idx) => (
    <div
      key={idx}
      className="py-5 px-4 px-md-5"
      style={{
        backgroundColor: idx % 2 === 0 ? "#fff8fc" : "#fff0f8",
        borderTop: "1px solid #ffd6f8",
        borderBottom: "1px solid #ffd6f8",
      }}
    >
      <div className="container" style={{ maxWidth: "1000px" }}>
        <h4 className="fw-semibold mb-3" style={{ color: "#a22191" }}>
          {item.title}
        </h4>
        <p style={{ fontSize: "16px", lineHeight: "1.7", color: "#b5488e" }}>
          {item.desc}
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
    {/* Highlighted CTA Section */}
    <div className="row mb-4">
      <div className="col-12  bg-opacity-10 p-4 rounded-3">
        <div className="row align-items-center">
          <div className="col-md-8 mb-3 mb-md-0">
            <h4 className="fw-bold text-white mb-2 mt-4 mt-md-0">
              Ready to Make a Difference?
            </h4>
            <p className="text-white-75 mb-0">
              Contact us today to learn more about our bulk purchase options and how QRitagya can transform your lost and found process.
            </p>
          </div>
          <div className="col-md-4 text-md-end">
            <button className="btn  rounded-pill px-4 py-2 fw-semibold shadow-sm" style={{ background: '#a22191',color:"white" }} >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Main Footer Grid - Expanded */}
    <div className="row pt-3 g-4">
      {/* Company Info - Expanded */}
      <div className="col-lg-3 col-md-6">
        <h5 className="fw-bold text-white mb-3">QRitagya</h5>
        <p className="text-white-75 small mb-3">
          The smart QR solution for secure item recovery and community-driven lost & found services.
        </p>
        <div className="d-flex gap-3 mb-3">
          <a href="#" className="text-white-75 hover-warning">
            <i className="bi bi-twitter fs-5"></i>
          </a>
          <a href="#" className="text-white-75 hover-warning">
            <i className="bi bi-instagram fs-5"></i>
          </a>
          <a href="#" className="text-white-75 hover-warning">
            <i className="bi bi-facebook fs-5"></i>
          </a>
          <a href="#" className="text-white-75 hover-warning">
            <i className="bi bi-linkedin fs-5"></i>
          </a>
        </div>
        <p className="text-muted small mb-0">
          © {new Date().getFullYear()} QRitagya Technologies Pvt. Ltd.
        </p>
      </div>

      {/* Contact Channels - Expanded */}
      <div className="col-lg-3 col-md-6">
        <h6 className="fw-bold text-white mb-3">Contact Channels</h6>
        <ul className="list-unstyled text-white-75 small">
          <li className="mb-2 d-flex align-items-start">
            <i className="bi bi-envelope me-2   mt-1" style={{ color: '#ffd6f8' }} ></i>
            <div>
              <div className="fw-medium">General Inquiries</div>
              <div>info@qritagya.com</div>
            </div>
          </li>
          <li className="mb-2 d-flex align-items-start">
            <i className="bi bi-headset me-2    mt-1" style={{ color: '#ffd6f8' }}></i>
            <div>
              <div className="fw-medium">Support</div>
              <div>support@qritagya.com</div>
            </div>
          </li>
          <li className="mb-2 d-flex align-items-start">
            <i className="bi bi-whatsapp me-2   mt-1" style={{ color: '#ffd6f8' }}></i>
            <div>
              <div className="fw-medium">WhatsApp Business</div>
              <div>+91 98765 43210</div>
            </div>
          </li>
          <li className="d-flex align-items-start">
            <i className="bi bi-telephone me-2    mt-1" style={{ color: '#ffd6f8' }}></i>
            <div>
              <div className="fw-medium">phone</div>
              <div>+91 98765 43211</div>
            </div>
          </li>
        </ul>
      </div>

      {/* Quick Links - Expanded */}
      <div className="col-lg-3 col-md-6">
        <h6 className="fw-bold text-white mb-3">Quick Links</h6>
        <div className="row">
          <div className="col-6">
            <ul className="list-unstyled text-white-75 small">
              <li className="mb-0">
                <a href="#" className="text-decoration-none custom-hover d-block py-1" >
                  How It Works
                </a>
              </li>
              <li className="mb-0">
                <a href="#" className="text-decoration-none custom-hover d-block py-1">
                  Pricing
                </a>
              </li>
              <li className="mb-0">
                <a href="#" className="text-decoration-none custom-hover d-block py-1">
                  Case Studies
                </a>
              </li>
              <li className="mb-0">
                <a href="#" className="text-decoration-none custom-hover d-block py-1">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div className="col-6">
            <ul className="list-unstyled text-white-75 small">
              <li className="mb-0">
                <a href="/terms-of-use" className="text-decoration-none custom-hover d-block py-1">
                  Terms of Use
                </a>
              </li>
              <li className="mb-0">
                <a href="/privacy-policy" className="text-decoration-none custom-hover d-block py-1">
                  Privacy Policy
                </a>
              </li>
              <li className="mb-0">
                <a href="#" className="text-decoration-none custom-hover d-block py-1">
                  GDPR Compliance
                </a>
              </li>
              <li>
                <a href="#" className="text-decoration-none custom-hover d-block py-1">
                  Sitemap
                </a>
              </li>
            </ul>
          </div>
          
        </div>
      </div>

      {/* Newsletter & Location - Expanded */}
      <div className="col-lg-3 col-md-6">
        <h6 className="fw-bold text-white mb-3">Stay Updated</h6>
        <p className="text-white-75 small mb-3">
          Subscribe for product updates, recovery tips, and community stories.
        </p>
        <div className="input-group mb-4">
          <input
            type="email"
            className="form-control bg-dark border-0 text-white"
            placeholder="Your email"
          />
          <button className="btn " style={{ background: '#a22191', color: '#fff' }}  >
            <i className="bi bi-send"></i>
          </button>
        </div>

        <h6 className="fw-bold text-white mb-2">Our Location</h6>
        <p className="text-white-75 small mb-1">
          <i className="bi bi-geo-alt    me-2"  style={{ color: '#ffd6f8' }}></i>
          14/05 Secure Plaza, Delhi, India - 110001
        </p>
        <a href="#" className="  small text-decoration-none" style={{ color: '#ffd6f8' }} >
          View on map <i className="bi bi-arrow-right"></i>
        </a>
      </div>
    </div>

    {/* Trust Badges */}
{/* 
    <div className="row mt-4 pt-3 border-top border-secondary">
      <div className="col-12">
        <div className="d-flex flex-wrap align-items-center justify-content-center gap-4">
          <img src="/images/payment-options.png" alt="Payment Options" height="30" className="opacity-75" />
          <span className="text-white-75 small">ISO 27001 Certified</span>
          <span className="text-white-75 small">GDPR Compliant</span>
          <span className="text-white-75 small">100% Secure Payments</span>
        </div>
      </div>
    </div> */}


  </div>

  {/* Bootstrap Icon CDN */}
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
  />

  <style jsx>{`
    .hover-warning:hover {
      color: #ffc107 !important;
      transition: color 0.2s ease;
    }
    .text-white-75 {
      color: rgba(255, 255, 255, 0.75);
    }
    .footer-section a:hover {
      text-decoration: none;
    }
      .custom-hover:hover {
      color: #a22191 !important;
     
    }
  `}</style>
</footer>




      </div>
    </>
  );
};

export default PrivacyPolicy;
