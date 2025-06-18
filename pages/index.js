import React, { useState } from "react";

import {
  Container,
  Navbar,
  Nav,
  NavDropdown,
  Card,
  Button,
  Row, 
  Col,
  Carousel , 
  Accordion ,
  Table 
} from "react-bootstrap";
import Image from "next/image";
 import { FaInfoCircle,FaTag, FaQrcode, FaShieldAlt,FaMoneyBillAlt, FaBuilding, FaLock, FaLeaf, FaChartPie , FaLanguage, FaWhatsapp , FaDollarSign,FaCheckCircle, FaTimesCircle , FaUserShield, FaHandsHelping,FaApple, FaAndroid,  FaRegMoneyBillAlt,  FaGlobe, FaUsers  } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { GiReturnArrow } from 'react-icons/gi';
import { IoMdPricetag } from 'react-icons/io';
import { RiUserSharedLine } from 'react-icons/ri';
import { BsPhone, BsBoxSeam } from 'react-icons/bs';
import Link from "next/link";
import NavbarsCode from "data/code/NavbarsCode";
import Navbard from './components/navbard'

const navItems = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
  // { label: "Articles", href: "/articles" },
  { label: "Contact", href: "/ContactUs" },
];

const NavbarCustom = () => {
  const [activeKey1, setActiveKey1] = useState("0");
  const [activeKey2, setActiveKey2] = useState("0");
  const [activeKey3, setActiveKey3] = useState("0");
  const [activeKey4, setActiveKey4] = useState("0");
  

  // Function to toggle the active accordion in Section 1
  const handleToggle1 = (key) => {
    if (activeKey1 === key) {
      setActiveKey1(""); // Close the current item if it's already open
    } else {
      setActiveKey1(key); // Open the new item
    }
  };

  // Function to toggle the active accordion in Section 2
  const handleToggle2 = (key) => {
    if (activeKey2 === key) {
      setActiveKey2(""); // Close the current item if it's already open
    } else {
      setActiveKey2(key); // Open the new item
    }
  };
  const handleToggle3 = (key) => {
    if (activeKey3 === key) {
      setActiveKey3(""); // Close the current item if it's already open
    } else {
      setActiveKey3(key); // Open the new item
    }
  };
  const handleToggle4 = (key) => {
    if (activeKey4 === key) {
      setActiveKey4(""); // Close the current item if it's already open
    } else {
      setActiveKey4(key); // Open the new item
    }
  };
  const [activeTab, setActiveTab] = useState('all');
  
  const features = [
    {
      name: "Cost per Tag",
      qritagya: { value: "Less than $2 for 5 years", icon: <FaCheckCircle className="text-success" /> },
      apple: { value: "$29 per tag", icon: <FaTimesCircle className="text-danger" /> },
      samsung: { value: "$29.99 per tag", icon: <FaTimesCircle className="text-danger" /> },
      category: "cost"
    },
    {
      name: "Subscription Fees",
      qritagya: { value: "None", icon: <FaCheckCircle className="text-success" /> },
      apple: { value: "None", icon: <FaCheckCircle className="text-success" /> },
      samsung: { value: "None", icon: <FaCheckCircle className="text-success" /> },
      category: "cost"
    },
    {
      name: "Anonymity",
      qritagya: { value: "Yes (no personal data shared)", icon: <FaCheckCircle className="text-success" /> },
      apple: { value: "Limited (Apple ID required)", icon: <FaTimesCircle className="text-danger" /> },
      samsung: { value: "Limited (Samsung account required)", icon: <FaTimesCircle className="text-danger" /> },
      category: "privacy"
    },
    {
      name: "Ecosystem Dependency",
      qritagya: { value: "None", icon: <FaCheckCircle className="text-success" /> },
      apple: { value: "Requires Apple ecosystem", icon: <FaTimesCircle className="text-danger" /> },
      samsung: { value: "Requires Samsung ecosystem", icon: <FaTimesCircle className="text-danger" /> },
      category: "compatibility"
    },
    {
      name: "Communication",
      qritagya: { value: "WhatsApp Business (global reach)", icon: <FaCheckCircle className="text-success" /> },
      apple: { value: "Apple-only communication", icon: <FaTimesCircle className="text-danger" /> },
      samsung: { value: "Samsung-only communication", icon: <FaTimesCircle className="text-danger" /> },
      category: "communication"
    },
    {
      name: "Language Support",
      qritagya: { value: "Built-in translator", icon: <FaCheckCircle className="text-success" /> },
      apple: { value: "None", icon: <FaTimesCircle className="text-danger" /> },
      samsung: { value: "None", icon: <FaTimesCircle className="text-danger" /> },
      category: "features"
    },
    {
      name: "Bulk Purchase Options",
      qritagya: { value: "Yes (ideal for large-scale use)", icon: <FaCheckCircle className="text-success" /> },
      apple: { value: "No", icon: <FaTimesCircle className="text-danger" /> },
      samsung: { value: "No", icon: <FaTimesCircle className="text-danger" /> },
      category: "business"
    },
    {
      name: "Service Duration",
      qritagya: { value: "5 years", icon: <FaCheckCircle className="text-success" /> },
      apple: { value: "Device-dependent", icon: <FaTimesCircle className="text-danger" /> },
      samsung: { value: "Device-dependent", icon: <FaTimesCircle className="text-danger" /> },
      category: "durability"
    },
    {
      name: "Community Focus",
      qritagya: { value: "High", icon: <FaCheckCircle className="text-success" /> },
      apple: { value: "Low", icon: <FaTimesCircle className="text-danger" /> },
      samsung: { value: "Low", icon: <FaTimesCircle className="text-danger" /> },
      category: "experience"
    }
  ];

  const filteredFeatures = activeTab === 'all' 
    ? features 
    : features.filter(f => f.category === activeTab);

  return (
    <>
      <Navbar expand="lg" bg="white" className="border-bottom py-3">
        <Container fluid className="px-4">
          {/* Logo */}
          <Navbar.Brand
            as={Link}
            href="/"
            className="d-flex align-items-center gap-2"
          >
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
            {/* Navigation Links */}
            <Nav className="mx-auto d-flex flex-column flex-lg-row gap-0 text-center text-lg-start px-19 ">
              {navItems.map((item, index) =>
                item.href ? (
                  <Nav.Link
                    key={index}
                    as={Link}
                    href={item.href}
                    className="fw-semibold text-dark nav-item-custom "
                  >
                    {item.label}
                  </Nav.Link>
                ) : null
              )}
            </Nav>

            <div className="d-flex flex-column flex-lg-row align-items-center gap-3 mt-3 mt-lg-0 ms-lg-auto w-100 w-lg-auto">
              <div className="w-100 d-flex justify-content-center d-lg-none">
                {/* Mobile view (split) */}
                <Link
                  href="/authentication/sign-in"
                  className="btn  text-white fw-semibold rounded-pill px-3 py-1"
                  style={{ backgroundColor: '#a22191', border: 'none' }}
                >
                  Login
                </Link>
              </div>

              {/* Desktop view (combined right) */}
              <div className="d-none d-lg-flex align-items-center gap-3">
              <Link
  href="/authentication/sign-in"
  className="btn btn-warning text-white fw-semibold rounded-pill px-3 py-1"
  style={{ backgroundColor: '#a22191', border: 'none' }}
>
  Login
</Link>

              </div>
            </div>
          </Navbar.Collapse>
        </Container>

        {/* Custom Styles */}
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

          .hover-warning:hover {
            color: #f79009;
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
       

      <div className="container py-5">
        <div className="row align-items-center">
          {/* Left side image */}
          <div className="col-lg-6 text-center mb-4 mb-lg-0">
            <img
              src="/assets/qrdash.png" // Replace with your image path
              alt="Launch"
              className="img-fluid"
              style={{ maxWidth: "60%", height: "auto" }}
            />
          </div>
   
          {/* Right side content */}
          <div className="col-lg-6">
            <h1 className="fw-bold display-5 text-dark mb-3">
              Secure Your Items <br />
              with a Simple <br />
              <span className="text-dark">QR Tag.</span>
            </h1>

            <p className="text-secondary fs-5 mb-4">
              Attach QR codes to your valuable items. If lost, a single scan
              connects finders to you — no app needed.
            </p>

            <button className="btn text-white px-4 py-2 fw-semibold rounded-pill shadow-sm"
            // here do text white  
             style={{ backgroundColor: '#a22191', border: 'none'  }}>
              Get Started Free
            </button>
          </div>
        </div>
      </div>

{/* introduction section */}

<section id="introduction" className="introduction-section mt-5">


<style jsx>{`
        .introduction-section {
  background-color: #fff7ff;
  // padding: 4rem 0;
}

.introduction-heading {
  color: #000;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.introduction-subheading {
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.introduction-content {
  color: #666;
  font-size: 1rem;
  line-height: 1.4;
  text-align: left;
}

.introduction-content p {
  margin-bottom: 1.2rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .introduction-heading {
    font-size: 2rem;
  }
  
  .introduction-subheading {
    font-size: 1.5rem;
  }
  
  .introduction-content {
    font-size: 1rem;
    text-align: left;
  }
}
        `}</style>
  

      <Container>
        <Row className="justify-content-center">
          <Col lg={10} className="text-center">
            <h2 className="introduction-heading fw-semibold">Introduction</h2>
            <h2 className="introduction-subheading">
              QRitagya: Revolutionizing Lost and Found with Gratitude and Technology
            </h2>
            <div className="introduction-content">
              <p>
                Welcome to QRitagya, an innovative lost and found platform designed to combine human
                compassion with cutting-edge technology.
              </p>
              <p>
                QRitagya, derived from the Hindi word for gratitude, is more than just a solution for lost
                items—it's a movement that celebrates the power of human kindness and the willingness
                to help others.
              </p>
              <p>
                By integrating unique QR codes, NFC technology, and a privacy-focused communication
                system, QRitagya makes it easier than ever to reunite people with their belongings while
                fostering trust and goodwill.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </section>

      {/* cards */}

      <div id="how-it-works" className="container py-5 mt-5">
        <div className="text-center mb-5">
          <p className="text-uppercase text-secondary fw-semibold mb-2">
            WHAT WE DO?
          </p>
          <h2 className="fw-bold text-dark fs-2">
            Helping you find lost items using QR magic.
          </h2>
        </div>

        <div className="row g-4">
          {/* CARD 1 */}
          <div className="col-md-6 col-lg-3">
            <div className="feature-card text-center">
              <div className="icon-circle bg-warning bg-opacity-25 mb-3 mx-auto">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1484/1484813.png"
                  alt="QR Tag"
                  width="32"
                />
              </div>
              <h5 className="fw-bold mb-2">QR Tagging</h5>
              <p className="text-muted small">
                Attach unique QR codes to wallets, keys, bags, or gadgets.
              </p>
              <a
                href="#"
                className="text-warning fw-semibold text-decoration-none small"
              >
                Learn More →
              </a>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="col-md-6 col-lg-3">
            <div className="feature-card text-center">
              <div className="icon-circle bg-danger bg-opacity-25 mb-3 mx-auto">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1048/1048953.png"
                  alt="Scan Icon"
                  width="32"
                />
              </div>
              <h5 className="fw-bold mb-2">Scan & Connect</h5>
              <p className="text-muted small">
                A finder scans the code to access owner contact instantly.
              </p>
              <a
                href="#"
                className="text-danger fw-semibold text-decoration-none small"
              >
                Learn More →
              </a>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="col-md-6 col-lg-3">
            <div className="feature-card text-center">
              <div className="icon-circle bg-success bg-opacity-25 mb-3 mx-auto">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1827/1827392.png"
                  alt="Alert Icon"
                  width="32"
                />
              </div>
              <h5 className="fw-bold mb-2">Real-Time Alerts</h5>
              <p className="text-muted small">
                Get notified when someone scans your lost item’s QR.
              </p>
              <a
                href="#"
                className="text-success fw-semibold text-decoration-none small"
              >
                Learn More →
              </a>
            </div>
          </div>

          {/* CARD 4 */}
          <div className="col-md-6 col-lg-3">
            <div className="feature-card text-center">
              <div className="icon-circle bg-primary bg-opacity-25 mb-3 mx-auto">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4341/4341139.png"
                  alt="Return Item Icon"
                  width="32"
                />
              </div>
              <h5 className="fw-bold mb-2">Item Returned</h5>
              <p className="text-muted small">
                Securely connect with the finder and arrange the return.
              </p>
              <a
                href="#"
                className="text-primary fw-semibold text-decoration-none small"
              >
                Learn More →
              </a>
            </div>
          </div>
        </div>

        {/* Extra CSS styling */}
        <style jsx>{`
          .feature-card {
            background: #fff;
            border-radius: 1rem;
            padding: 2rem 1.5rem;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.04);
            transition: all 0.3s ease;
            height: 100%;
          }
          .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          }
          .icon-circle {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
      </div>

{/* both section slider  */}

<section id="introduction-slider" style={{  
backgroundImage: `url("/assets/home-main.png")`,
backgroundRepeat: 'repeat',
backgroundSize: 'contain',
backgroundColor: '#ffffff',
padding: '3rem 0',

    }}>
      <Container>
        <Carousel indicators={false} interval={5000} variant="dark">
          {/* Slide 1 - Introduction Part 2 */}
          <Carousel.Item>
            <div className="text-center ">
              <h2 style={{ color: '#333', fontSize: '1.3rem', fontWeight: '600', marginBottom: '2rem' }}>
                The Power of Human Connection in Locating Lost Items
              </h2>
              <div style={{ color: '#666', fontSize: '1rem', lineHeight: '1.4', textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
                <p>
                  While technology has transformed how we locate lost items, human behaviour remains the
                  cornerstone of successful recoveries. Studies indicate that people are naturally inclined to
                  help others in need, especially when the process is made simple and secure.
                </p>
                <p>
                  QRitagya taps into this innate human trait by providing a platform that allows individuals to connect
                  anonymously and effectively.
                </p>
              </div>
            </div>
          </Carousel.Item>

          {/* Slide 2 - Introduction Part 3 */}
          <Carousel.Item>
            <div className="text-center">
              <h2 style={{ color: '#333', fontSize: '1.3rem', fontWeight: '600', marginBottom: '2rem' }}>
                Why Human Behaviour is Superior
              </h2>
              <div style={{ color: '#666', fontSize: '1rem', lineHeight: '1.4', textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
                <ul style={{ paddingLeft: '1.5rem' }}>
                  <li style={{ marginBottom: '1.2rem', listStyleType: 'none' }}>
                    <strong style={{ color: '#a22191' }}>Empathy Drives Action:</strong> People are more likely to assist when they feel a personal
                    connection or sense of purpose, especially when the platform facilitates gratitude and
                    appreciation.
                  </li>
                  <li style={{ marginBottom: '1.2rem', listStyleType: 'none' }}>
                    <strong style={{ color: '#a22191' }}>Trust and Community:</strong> Unlike purely automated systems, QRitagya fosters a sense of
                    community by encouraging individuals to participate in a meaningful way.
                  </li>
                  <li style={{ marginBottom: '1.2rem', listStyleType: 'none' }}>
                    <strong style={{ color: '#a22191' }}>Anonymity with Accountability:</strong> QRitagya ensures privacy for both owners and finders,
                    creating a safe space for interaction while maintaining accountability through the platform.
                  </li>
                </ul>
              </div>
            </div>
          </Carousel.Item>
        </Carousel>
      </Container>
    </section>


{/* how qritagya works */}


<Container className="my-5 py-4">
      <h2 className="text-center mb-5 fw-semibold">How QRitagya Works</h2>
      <div className="vertical-steps">
        <div className="step">
          <div className="step-circle">1</div>
          <div className="step-content">
            {/* <h4>Tag It</h4> */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <FaTag style={{ color: '#a22191' }} size={20} />
              <h4 className="fw-semibold mb-0">Tag It</h4>
            </div>
            <p>Attach a QRitagya tag to your belongings. Each tag features a unique QR code and NFC chip for instant identification.</p>
          </div>
        </div>
        
        <div className="step">
          <div className="step-circle">2</div>
          <div className="step-content">
            {/* <h4>Scan and Notify</h4> */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <FaQrcode style={{ color: '#a22191' }} size={20} />
              <h4 className="fw-semibold mb-0">Scan and Notify</h4>
            </div>
            <p>If an item is found, the finder can scan the QR code or tap the NFC tag to notify the owner without revealing personal information.</p>
          </div>
        </div>
        
        <div className="step">
          <div className="step-circle">3</div>
          <div className="step-content">
            {/* <h4>Secure Communication</h4> */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <FaShieldAlt  size={20} style={{ color: '#a22191' }} />
              <h4 className="fw-semibold mb-0">Secure Communication</h4>
            </div>
            <p>Initial communication happens through QRitagya's WhatsApp Business account, ensuring privacy for both parties.</p>
          </div>
        </div>
        
        <div className="step">
          <div className="step-circle">4</div>
          <div className="step-content">
            {/* <h4>Language Translation</h4> */}
            <div className="d-flex align-items-center gap-2 mb-3">
            <FaLanguage style={{ color: '#a22191' }} size={20} />

              <h4 className="fw-semibold mb-0">Language Translation</h4>
            </div>
            <p>With a built-in language converter, QRitagya enables seamless communication across different  languages, breaking down barriers and increasing the
            chances of recovery.</p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .vertical-steps {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
        }
        .step {
          display: flex;
          margin-bottom: 30px;
          position: relative;
        }
        .step-circle {
          width: 50px;
          height: 50px;
          // background: #0d6efd;
           background: #a22191;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
          flex-shrink: 0;
          margin-right: 20px;
        }
        .step-content {
          background: #fffbff;
          padding: 20px;
          color: #666;
          border-radius: 8px;
            border-left: 4px solid #a22191;
          flex-grow: 1;
        }
        .step:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 25px;
          top: 70px;
          bottom: -30px;
          width: 2px;
          background: #dee2e6;
           
        }
        @media (min-width: 768px) {
          .step-content {
            padding: 25px;
          }
        }
      `}</style>
    </Container>

    {/* Why QRitagya is a Game-Changer */}



    <Container className="my-5 py-5 game-changer-section">
      <h2 className="text-center mb-5  fw-semibold">Why QRitagya is a <span style={{ color: '#a22191' }}>Game-Changer</span></h2>
      
      <Row className="g-4">
        <Col lg={4} md={6}>
          <div className="feature-card cost-effective">
            <div className="icon-wrapper">
              <FaDollarSign size={32} />
            </div>
            <h3 className="text-center" >Cost-Effective and Accessible</h3>
            <p>QRitagya tags cost less than $2 for 5 years of service, making them an affordable alternative to expensive competitors like Apple AirTags and Samsung Galaxy SmartTags, which cost over $20 each. This affordability makes QRitagya the ideal choice for institutions, corporates, and government organizations looking to purchase in bulk.</p>
          </div>
        </Col>
        
        <Col lg={4} md={6}>
          <div className="feature-card privacy-focused">
            <div className="icon-wrapper">
              <FaUserShield size={32} />
            </div>
            <h3 className="text-center">Privacy-Focused</h3>
            <p>Unlike other tracking solutions that require users to share personal data or be part of a closed ecosystem (like Apple or Samsung accounts), QRitagya prioritizes anonymity. Both the owner and finder can communicate without sharing personal details, ensuring a safe and secure experience.</p>
          </div>
        </Col>
        
        <Col lg={4}>
          <div className="feature-card human-centric">
            <div className="icon-wrapper">
              <FaHandsHelping size={32} />
            </div>
            <h3 className="text-center">Human-Centric Approach</h3>
            <p>While other products rely heavily on technology, QRitagya emphasizes the human element, encouraging people to help one another and fostering a sense of gratitude and community.</p>
          </div>
        </Col>
      </Row>

      <style jsx>{`

      .icon-wrapper {
           margin: 0 auto;
      }
        .game-changer-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        }
        .text-gradient {
          // background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
          // -webkit-background-clip: text;
          // background-clip: text;
          // color: transparent;
          color: #f7a961;
        }
        .feature-card {
          height: 95%;
          padding: 2rem;
          border-radius: 12px;
          background: white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border-top: 4px solid transparent;
        }
        .feature-card:hover {
           transform: translateY(-5px);
           box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
        .feature-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background:  #A22191;
          transition: all 0.3s ease;
          transform: scaleX(0);
        }
        .feature-card:hover::after {
          transform: scaleX(1);
        }
        .icon-wrapper {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .cost-effective .icon-wrapper {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
        .privacy-focused .icon-wrapper {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
        }
        .human-centric .icon-wrapper {
          background: rgba(236, 72, 153, 0.1);
          color: #ec4899;
        }
        h3 {
          color: #1e293b;
          margin-bottom: 1rem;
          font-weight: 600;
          font-size: 19px;
        }
        p {
          color: #64748b;
          line-height: 1.7;
          text-align: left;
     

        }
      `}</style>
    </Container>


{/* 
    Comparative Analysis: QRitagya vs. Competitors */}

<Container className="my-5 py-5">
      <h2 className="text-center mb-5   fw-semibold"style={{ color: '#a22191' }} >QRitagya <span className="text-dark">vs. Competitors</span></h2>
      
      <div className="tabs mb-4 d-flex justify-content-center flex-wrap">
        <Button 
          variant={activeTab === 'all' ? 'primary' : 'outline-primary'} 
          className="m-1 rounded-pill"
          onClick={() => setActiveTab('all')}
        >
          All Features
        </Button>
        <Button 
          variant={activeTab === 'cost' ? 'primary' : 'outline-primary'} 
          className="m-1 rounded-pill"
          onClick={() => setActiveTab('cost')}
        >
          Pricing
        </Button>
        <Button 
          variant={activeTab === 'privacy' ? 'primary' : 'outline-primary'} 
          className="m-1 rounded-pill"
          onClick={() => setActiveTab('privacy')}
        >
          Privacy
        </Button>
        <Button 
          variant={activeTab === 'compatibility' ? 'primary' : 'outline-primary'} 
          className="m-1 rounded-pill"
          onClick={() => setActiveTab('compatibility')}
        >
          Compatibility
        </Button>
        <Button 
          variant={activeTab === 'features' ? 'primary' : 'outline-primary'} 
          className="m-1 rounded-pill"
          onClick={() => setActiveTab('features')}
        >
          Features
        </Button>
        <Button 
          variant={activeTab === 'business' ? 'primary' : 'outline-primary'} 
          className="m-1 rounded-pill"
          onClick={() => setActiveTab('business')}
        >
          Business
        </Button>
        <Button 
          variant={activeTab === 'experience' ? 'primary' : 'outline-primary'} 
          className="m-1 rounded-pill"
          onClick={() => setActiveTab('experience')}
        >
          Experience
        </Button>
      </div>
      
{/*    
      <div className="comparison-table-wrapper bg-white rounded-3 p-3 p-md-4 shadow-sm">
        <Table borderless responsive className="mb-0">
          <thead>
            <tr className="border-bottom">
              <th className="fw-semibold text-muted ps-3 ps-md-4">Feature</th>
              <th className="fw-semibold text-center text-success" >QRitagya</th>
              <th className="fw-semibold text-center">Apple AirTag</th>
              <th className="fw-semibold text-center text-primary">Samsung SmartTag</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeatures.map((feature, index) => (
              <tr key={index} className="border-bottom">
                <td className="ps-3 ps-md-4 align-middle fw-medium"  >{feature.name}</td>
                <td className="text-start align-middle  bg-opacity-10" style={{ background: 'rgba(16, 185, 129, 0.05)'}}>
                  <div className="d-inline-flex align-items-center">
                    {feature.qritagya.icon}
                    <span className="ms-2">{feature.qritagya.value}</span>
                  </div>
                </td>
                <td className="text-start align-middle" >
                  <div className="d-inline-flex align-items-center">
                    {feature.apple.icon}
                    <span className="ms-2">{feature.apple.value}</span>
                  </div>
                </td>
                <td className="text-start align-middle  bg-opacity-10" style={{   background: 'rgba(0, 112, 240, 0.05)'}} >
                  <div className="d-inline-flex align-items-center">
                    {feature.samsung.icon}
                    <span className="ms-2">{feature.samsung.value}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>  */}

<div className="comparison-table-wrapper bg-white rounded-3 p-3 p-md-4 shadow-sm">
  <Table borderless responsive className="mb-0">
    <thead>
      <tr className="border-bottom">
        <th className="fw-semibold text-muted ps-3 ps-md-4">Feature</th>
        <th className="fw-semibold text-center text-success">QRitagya</th>
        <th className="fw-semibold text-center">Apple AirTag</th>
        <th className="fw-semibold text-center text-primary">Samsung SmartTag</th>
      </tr>
    </thead>
    <tbody>
      {filteredFeatures.map((feature, index) => (
        <tr key={index} className="border-bottom">
          <td className="ps-3 ps-md-4 align-middle fw-medium">{feature.name}</td>
          <td className="text-start align-middle bg-opacity-10" style={{ background: 'rgba(16, 185, 129, 0.05)'}}>
            <div className="d-inline-flex align-items-center">
              {/* Added mobile-icon class ONLY for mobile scaling */}
              <span className="mobile-icon">
                {feature.qritagya.icon}
              </span>
              <span className="ms-2">{feature.qritagya.value}</span>
            </div>
          </td>
          <td className="text-start align-middle">
            <div className="d-inline-flex align-items-center">
              <span className="mobile-icon">
                {feature.apple.icon}
              </span>
              <span className="ms-2">{feature.apple.value}</span>
            </div>
          </td>
          <td className="text-start align-middle bg-opacity-10" style={{ background: 'rgba(0, 112, 240, 0.05)'}}>
            <div className="d-inline-flex align-items-center">
              <span className="mobile-icon">
                {feature.samsung.icon}
              </span>
              <span className="ms-2">{feature.samsung.value}</span>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
</div>
      <style jsx>{`
        .comparison-table-wrapper {
          border: 1px solid rgba(0,0,0,0.05);
        }
        th {
          padding-bottom: 1rem;
          padding-top: 1rem;
        }
        td {
          padding: 1.25rem 0.5rem;
          vertical-align: middle;
        }
        
        @media (max-width: 768px) {
          td, th {
            font-size: 0.9rem;
            padding: 0.75rem 0.25rem;
          }
        }

/* DEFAULT (Desktop) - No changes, icons remain original size */
.mobile-icon {
  display: inline-block;
}

/* MOBILE ONLY - Increases icon size */
@media (max-width: 768px) {
  .mobile-icon {
    transform: scale(1.3); /* 1.5x larger */
    margin-right: 8px; /* Adjust spacing if needed */
  }
  
  /* Optional: Prevent text wrapping */
  .comparison-table-wrapper td {
    white-space: wrap;
  }
}

      `}</style>
    </Container>


    {/* Why Institutions, Corporates, and Governments Should Choose QRitagya */}

    <Container className="my-5 py-5">
      <Row className="align-items-center">
        {/* Left Column - Benefits */}
        <Col lg={6} className="pe-lg-5 mb-5 mb-lg-0">
          <h2 className="cus-mob fw-semibold mb-4 text-nowrap">
            Why Institutions, Corporates, and <br/> Governments Should Choose <span style={{ color: '#a22191' }}>QRitagya</span>
          </h2>
          
          <div className="benefit-item d-flex mb-4">
            <div className="benefit-icon me-4">
              <FaMoneyBillAlt className="text-success" size={28} />
            </div>
            <div>
              <h4 className="fw-semibold">Cost Savings</h4>
              <p className="text-muted">At less than $2 per tag for 5 years, QRitagya offers unmatched affordability, enabling organizations to purchase large quantities without straining budgets.</p>
            </div>
          </div>
          
          <div className="benefit-item d-flex mb-4">
            <div className="benefit-icon me-4">
              <FaBuilding className="text-primary" size={28} />
            </div>
            <div>
              <h4 className="fw-semibold">Scalability</h4>
              <p className="text-muted">The platform is designed for large-scale use, making it ideal for schools, universities, airports, public transport systems, and government offices.</p>
            </div>
          </div>
          
          <div className="benefit-item d-flex mb-4">
            <div className="benefit-icon me-4">
              <FaLock className="text-warning" size={28} />
            </div>
            <div>
              <h4 className="fw-semibold">Enhanced Security</h4>
              <p className="text-muted">With anonymized communication and no dependency on specific ecosystems, QRitagya ensures the privacy and security of users.</p>
            </div>
          </div>
          
          <div className="benefit-item d-flex">
            <div className="benefit-icon me-4">
              <FaLeaf className="text-info" size={28} />
            </div>
            <div>
              <h4 className="fw-semibold">CSR Benefits</h4>
              <p className="text-muted">By adopting QRitagya, organizations can demonstrate their commitment to fostering community engagement and sustainability.</p>
            </div>
          </div>
        </Col>
        
        {/* Right Column - Stats */}
        <Col lg={6} className="ps-lg-5 mt-md-5 mt-0">
          <div className="infographic-box p-4 p-lg-5 rounded-4">
            <h3 className="text-white mb-4 d-flex align-items-center">
              <FaChartPie className="me-3" />
              Real-World Impact
            </h3>
            
            <div className="stat-item mb-4">
              <div className="stat-header d-flex align-items-center mb-2">
                <GiReturnArrow className="text-white me-2" size={24} />
                <span className="text-white fw-semibold">95% Return Rate</span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-success" 
                  role="progressbar" 
                  style={{ width: '95%' }}
                ></div>
              </div>
              <div className="stat-caption text-white-50 mt-2">
                of people are willing to return a lost item if the process is simple and secure (Source: Behavioral Studies on Altruism)
              </div>
            </div>
            
            <div className="stat-item mb-4">
              <div className="stat-header d-flex align-items-center mb-2">
                <GiReturnArrow className="text-white me-2" size={24} />
                <span className="text-white fw-semibold">70% Recovery Rate</span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-primary" 
                  role="progressbar" 
                  style={{ width: '70%' }}
                ></div>
              </div>
              <div className="stat-caption text-white-50 mt-2">
                of lost items are recovered when there is a clear mechanism for communication between the owner and finder.
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-header d-flex align-items-center mb-2">
                <GiReturnArrow className="text-white me-2" size={24} />
                <span className="text-white fw-semibold">Millions Saved</span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-warning" 
                  role="progressbar" 
                  style={{ width: '100%' }}
                ></div>
              </div>
              <div className="stat-caption text-white-50 mt-2">
                Institutions and governments spend millions annually on lost property management. QRitagya can reduce these costs significantly while improving efficiency.
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <style jsx>{`
        .benefit-icon {
          min-width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.05);
        }
        .infographic-box {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          height: 100%;
        }
        .stat-header {
          font-size: 1.1rem;
        }
        .stat-caption {
          font-size: 0.9rem;
        }
        
        @media (max-width: 992px) {
          .pe-lg-5, .ps-lg-5 {
            padding-right: 15px !important;
            padding-left: 15px !important;
          }
        }

         @media (max-width: 576px) {
         .cus-mob{
             font-size: 18px;
         }
        }
      `}</style>
    </Container>

{/* 
      <div className="container py-5">
        <div className="row align-items-center">
        
          <div className="col-md-6 mb-5 mb-md-0">
            <p className="text-uppercase text-secondary fw-semibold mb-2">
              QUICK CHECK
            </p>
            <h2 className="fw-bold text-dark mb-3">
              Lost something?
              <br />
              Check your item's QR status now.
            </h2>
            <p className="text-muted mb-4">
              Enter your item's QR code or serial number to check if someone has
              found it. Our system will instantly show scan activity, messages,
              or contact links.
            </p>

         
            <div
              className="d-flex shadow rounded-pill overflow-hidden"
              style={{ maxWidth: "420px" }}
            >
              <input
                type="text"
                placeholder="Enter QR Code or Serial"
                className="form-control border-0 ps-4"
              />
              <button className="btn btn-warning px-4 fw-semibold rounded-0 rounded-end">
                Check
              </button>
            </div>
          </div>

       
          <div className="col-md-6 text-center">
            <img
              src="/assets/qrdash2.png"
              alt="QR Check Illustration"
              className="img-fluid"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        </div>
      </div> */}

      <div className="container py-5 mt-5">
        <div className="row align-items-center">
          {/* LEFT SIDE – TEXT */}
          <div className="col-lg-5 mb-5 mb-lg-0">
            <p className="text-uppercase text-secondary fw-semibold mb-2">
              Our Community
            </p>
            <h3 className="fw-bold text-dark mb-3">
            Join the QRitagya Movement
            </h3>
            <p className="text-muted mb-4">
            At QRitagya, we’re not just solving a problem—we’re creating a culture of gratitude and
connection. By choosing QRitagya, you’re not only investing in a practical solution but also
contributing to a world where kindness and empathy are celebrated.
            </p>
            <button className="btn   px-4 fw-semibold rounded-pill shadow-sm " style={{ background: '#a22191', color : '#fff' }}>
              All Stories
            </button>
          </div>

          {/* RIGHT SIDE – ZIGZAG CARDS */}
          <div className="col-lg-7">
            <div className="row gx-4 gy-4">
              {/* Card 1 */}
              <div className="col-sm-6">
                <div className="testimonial-card border-start border-4 border-warning h-100">
                  <div className="quote-icon">❝</div>
                  <p>
                    “I lost my AirPods at a café. Someone scanned the QR and I
                    had them back in 2 hours.”
                  </p>
                  <h6 className="fw-bold mb-0">Neha Sharma</h6>
                  <small className="text-muted">Student, Delhi</small>
                </div>
              </div>

              {/* Card 2 */}
              <div className="col-sm-6">
                <div className="testimonial-card border-start border-4 border-danger h-100">
                  <div className="quote-icon">❝</div>
                  <p>
                    “Tagged my luggage with QR. Airline misplaced it — someone
                    scanned it at arrival. Lifesaver!”
                  </p>
                  <h6 className="fw-bold mb-0">Ravi Khanna</h6>
                  <small className="text-muted">Frequent Flyer</small>
                </div>
              </div>

              {/* Card 3 */}
              <div className="col-sm-6 offset-sm-1 mt-sm-4">
                <div className="testimonial-card border-start border-4 border-success h-100">
                  <div className="quote-icon">❝</div>
                  <p>
                    “Lost my backpack at a college fest. A stranger scanned the
                    tag and contacted me. Just wow.”
                  </p>
                  <h6 className="fw-bold mb-0">Simran Mehta</h6>
                  <small className="text-muted">Designer, Mumbai</small>
                </div>
              </div>

              {/* Card 4 */}
              <div className="col-sm-5">
                <div className="testimonial-card border-start border-4 border-primary h-100">
                  <div className="quote-icon">❝</div>
                  <p>
                    “I added a QR to my camera gear. I dropped it on a shoot —
                    got it back the next morning.”
                  </p>
                  <h6 className="fw-bold mb-0">Aditya Rao</h6>
                  <small className="text-muted">Photographer</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOM STYLES */}

        <style jsx>{`
          .testimonial-card {
            background: #fff;
            border-radius: 1rem;
            padding: 1.75rem 1.5rem 1.5rem 2rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            position: relative;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .testimonial-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          }

          .quote-icon {
            font-size: 2rem;
            color: #f79009;
            position: absolute;
            top: 1rem;
            left: 1rem;
            opacity: 0.08;
          }

          .testimonial-card p {
            font-size: 0.95rem;
            color: #333;
            line-height: 1.6;
            margin-bottom: 1rem;
          }

          .testimonial-card h6 {
            font-size: 1rem;
          }

          .testimonial-card small {
            font-size: 0.85rem;
          }
        `}</style>
      </div>

      <div className="container py-5" id="faq">
        <h3 className="text-center fw-bold mb-4">Frequently Asked Questions</h3>
        <div className="d-flex flex-wrap justify-content-center">
          {/* Section 1 */}

          <div className="col-md-5 mx-2 mb-4">
            <div className="accordion-item">
              <div className="accordion-header">
                <div
                  style={{
                    color: activeKey1 == "1" ? "#a22191" : "#000", // Text color (white when active, orange when collapsed)
                    border:
                      activeKey1 == "1"
                        ? "2px solid #a22191"
                        : "2px solid #a22191", // Border color remains same but can be dynamic too
                  }}
                  className={`d-flex justify-content-between align-items-center p-3 
            ${activeKey1 === "1" ? "" : "collapsed"}`}
                  onClick={() => handleToggle1("1")}
                >
                  <p className="m-0">What is QR Tagging?</p>
                  <p className="m-0">
                    {activeKey1 === "1" ? (
                      <FiChevronDown style={{ transform: "rotate(180deg)" }} />
                    ) : (
                      <FiChevronDown />
                    )}
                    {/* <FiChevronDown/> */}
                  </p>
                </div>
              </div>
              <div
                className={`accordion-body ${activeKey1 === "1" ? "show" : ""}`}
              >
                QR Tagging is the process of attaching unique QR codes to your
                valuable items like keys, wallets, or gadgets. When someone
                scans the QR code, they can instantly access your contact
                information to return the lost item.
              </div>
            </div>

            <div className="accordion-item">
              <div className="accordion-header">
                <div
                  style={{
                    color: activeKey2 === "1" ? "#a22191" : "#000", // Text color (white when active, orange when collapsed)
                    border:
                      activeKey2 === "1"
                        ? "2px solid #a22191"
                        : "2px solid #a22191", // Border color remains same but can be dynamic too
                  }}
                  className={`d-flex justify-content-between align-items-center p-3
              ${activeKey2 === "1" ? "" : "collapsed"}`}
                  onClick={() => handleToggle2("1")}
                >
                  <p className="m-0">
                    How does the scan and connect process work?
                  </p>

                  <p className="m-0">
                  {activeKey2 === "1" ? (
                      <FiChevronDown style={{ transform: "rotate(180deg)" }} />
                    ) : (
                      <FiChevronDown />
                    )}
                  </p>
                </div>
              </div>
              <div
                className={`accordion-body ${activeKey2 === "1" ? "show" : ""}`}
              >
                When a person finds your lost item, they simply scan the QR
                code. This scan connects them directly to your contact details,
                allowing them to reach out to you instantly without needing an
                app.
              </div>
            </div>
          </div>

          {/* Section 2 */}

          <div className="col-md-5 mx-2 mb-4">
            <div className="accordion-item">
              <div className="accordion-header">
                <div
                  style={{
                    color: activeKey3 === "1" ? "#a22191" : "#000", // Text color (white when active, orange when collapsed)
                    border:
                      activeKey3 === "1"
                        ? "2px solid #a22191"
                        : "2px solid #a22191", // Border color remains same but can be dynamic too
                  }}
                  className={`d-flex justify-content-between align-items-center p-3
              ${activeKey3 === "1" ? "" : "collapsed"}`}
                  onClick={() => handleToggle3("1")}
                >
                  <p className="m-0">What happens if my item is lost?</p>

                  <p className="m-0">
                  {activeKey3 === "1" ? (
                      <FiChevronDown style={{ transform: "rotate(180deg)" }} />
                    ) : (
                      <FiChevronDown />
                    )}
                  </p>
                </div>
              </div>
              <div
                className={`accordion-body ${activeKey3 === "1" ? "show" : ""}`}
              >
                If your item is lost, you will receive an immediate notification
                when someone scans your QR code. You can then securely arrange
                the return of the item by getting in touch with the person who
                found it.
              </div>
            </div>

            <div className="accordion-item">
              <div className="accordion-header">
                <div
                  style={{
                    color: activeKey4 === "1" ? "#a22191" : "#000", // Text color (white when active, orange when collapsed)
                    border:
                      activeKey4 === "1"
                        ? "2px solid #a22191"
                        : "2px solid #a22191", // Border color remains same but can be dynamic too
                  }}
                  className={`d-flex justify-content-between align-items-center p-3
              ${activeKey4 === "1" ? "" : "collapsed"}`}
                  onClick={() => handleToggle4("1")}
                >
                  <p className="m-0">How do I set up QR codes on my items?</p>

                  <p className="m-0">
                  {activeKey4 === "1" ? (
                      <FiChevronDown style={{ transform: "rotate(180deg)" }} />
                    ) : (
                      <FiChevronDown />
                    )}
                  </p>
                </div>
              </div>
              <div
                className={`accordion-body ${activeKey4 === "1" ? "show" : ""}`}
              >
                Setting up QR codes is easy! Simply purchase a QR Tag, attach it
                to your item, and register the tag on our website with your
                contact information. That's it — your item is now secure!
              </div>
            </div>
          </div>
        </div>

        {/* Custom Styling for Accordion */}
        <style jsx>{`
          .accordion-item {
            border: 1px solid #f1f1f1;
            margin-bottom: 10px;
            border-radius: 10px;
          }

          .accordion-header {
            background-color: #fff;
            border: none;
          }

          .accordion-button {
            background-color: #fff;
            color: #f79009;
            font-weight: bold;
            border: 2px solid #f79009;
            text-align: left;
            width: 100%;
            padding: 1rem;
            transition: background-color 0.3s ease, color 0.3s ease;
          }

          .accordion-button:not(.collapsed) {
            background-color: #f79009;
            color: #fff;
          }

          .accordion-body {
            font-size: 0.95rem;
            color: #333;
            padding: 1rem;
            background-color: #fffbff;
          }

          .container {
            max-width: 1200px;
          }

          .collapsed {
            background-color: #fff;
          }

          .show {
            display: block;
          }

          .accordion-body:not(.show) {
            display: none;
          }
        `}</style>
      </div>

      {/* footer */}


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



    </>
  );
};

export default NavbarCustom;
