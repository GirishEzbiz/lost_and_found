// components/MainNavbar.jsx
import React from "react";
import { Container, Navbar, Nav } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";

const navItems = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "/ContactUs" },
];

const MainNavbar = () => {
  return (
    <Navbar expand="lg" bg="white" className="border-bottom py-3">
      <Container fluid className="px-4">
        {/* Logo */}
        <Navbar.Brand as={Link} href="/" className="d-flex align-items-center gap-2">
          <Image
            src="/assets/new_qritagya_logo.png"
            alt="Logo"
            width={75}
            height={70}
            className="align-left"
          />
        </Navbar.Brand>

        {/* Hamburger menu toggle */}
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="mx-auto d-flex flex-column flex-lg-row gap-3 text-center text-lg-start px-19">
            {navItems.map((item, index) =>
              item.href ? (
                <Nav.Link
                  key={index}
                  as={Link}
                  href={item.href}
                  className="fw-semibold text-dark nav-item-custom"
                >
                  {item.label}
                </Nav.Link>
              ) : null
            )}
          </Nav>

          <div className="d-flex flex-column flex-lg-row align-items-center gap-3 mt-3 mt-lg-0 ms-lg-auto w-100 w-lg-auto">
            <div className="w-100 d-flex justify-content-between d-lg-none">
              <Link
                href="/authentication/sign-in"
                className="btn btn-warning text-white fw-semibold rounded-pill px-3 py-1"
              >
                Login
              </Link>
            </div>
            <div className="d-none d-lg-flex align-items-center gap-3">
              <Link
                href="/authentication/sign-in"
                className="btn   text-white fw-semibold rounded-pill px-3 py-1" style={{ background: '#a22191' }}
              >
                Login
              </Link>
            </div>
          </div>
        </Navbar.Collapse>
      </Container>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        .nav-item-custom {
          transition: color 0.2s ease;
          font-size: 1rem;
        }
        .nav-item-custom:hover {
          color: #f79009 !important;
        }
        .navbar {
          box-shadow: none !important;
        }
        .dropdown-menu {
          border-radius: 0.6rem;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
        }
        .dropdown-item:hover {
          background-color: #f79009 !important;
          color: white !important;
        }
      `}</style>
    </Navbar>
  );
};

export default MainNavbar;
