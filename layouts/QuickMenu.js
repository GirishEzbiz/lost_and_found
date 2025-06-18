// QuickMenu.js
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Row, Col, Dropdown, ListGroup } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import NotificationList from "data/Notification";
import useMounted from "hooks/useMounted";
import Cookies from "js-cookie";
import { getAdminDetail } from "lib/getAdminDetail";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  FiMonitor,
  FiCreditCard,
  FiHelpCircle,
  FiDatabase,
  FiMessageSquare,
  FiPower,
  FiChevronRight,
} from "react-icons/fi";
const getInitials = (name = "") => {
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

import { FiBell, FiSettings } from "react-icons/fi";
const QuickMenu = ({ type = "admin" }) => {
  const [user, setUser] = useState({});
  const router = useRouter();
  const [prefix, setPrefix] = useState("admin"); // Default prefix

  useEffect(() => {
    const userKind = localStorage.getItem("user_kind");
    if (userKind === "bt") {
      setPrefix("brand");
    } else {
      setPrefix("admin");
    }
  }, []);

  const hasMounted = useMounted();
  const isDesktop = useMediaQuery({
    query: "(min-width: 1224px)",
  });
  const rtyop = type != "" ? type : "admin";
  const handleSignOut = () => {
    Cookies.remove("adminToken");
    localStorage.removeItem("adminToken");
    window.location.href = `/${rtyop}/login`;
  };

  useEffect(() => {
    const userD = getAdminDetail();

    setUser(userD);
  }, []);

  const hasPermission = (permission) => user?.permissions?.includes(permission);

  const Notifications = () => {
    return (
      <SimpleBar style={{ maxHeight: "300px" }}>
        <ListGroup variant="flush">
          {NotificationList.map((item, index) => (
            <ListGroup.Item
              className={index === 0 ? "bg-light" : ""}
              key={index}
            >
              <Row>
                <Col>
                  <Link href="#" className="text-muted">
                    <h5 className="mb-1">{item.sender}</h5>
                    <p className="mb-0">{item.message}</p>
                  </Link>
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </SimpleBar>
    );
  };

  const QuickMenuContent = () => {
    return (
      <ListGroup
        as="ul"
        bsPrefix="navbar-nav"
        className="navbar-right-wrap ms-2 d-flex nav-top-wrap"
      >
        <Dropdown as="li">
          {user.role === 12 && (
            <Dropdown.Toggle
              as="a"
              bsPrefix=" "
              id="dropdownNotification"
              className="btn btn-light btn-icon rounded-circle indicator indicator-primary text-muted"
              onClick={() => router.push("/admin/setting")}
            >
              <FiSettings />
            </Dropdown.Toggle>
          )}
        </Dropdown>
        {/* <Dropdown as="li" className="ms-1">
          <Dropdown.Toggle
            as="a"
            bsPrefix=" "
            id="dropdownNotification"
            className="btn btn-light btn-icon rounded-circle indicator indicator-primary text-muted "
          >
            <FiBell />
          </Dropdown.Toggle>
          <Dropdown.Menu
            className="dashboard-dropdown notifications-dropdown dropdown-menu-lg dropdown-menu-end py-0"
            align="end"
          >
            <Dropdown.Item className="mt-3" bsPrefix=" " as="div">
              <div className="border-bottom px-3 pt-0 pb-3 d-flex justify-content-between align-items-end">
                <span className="h4 mb-0">Notifications</span>
                <Link href="/" className="text-muted">
                  <span className="align-middle">
                    <i className="fe fe-settings me-1"></i>
                  </span>
                </Link>
              </div>
              <Notifications />
              <div className="border-top px-3 pt-3 pb-3">
                <Link
                  href="/dashboard/notification-history"
                  className="text-link fw-semi-bold"
                >
                  See all Notifications
                </Link>
              </div>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown> */}

        <Dropdown as="li" className="ms-2">
          <Dropdown.Toggle
            as="a"
            bsPrefix=" "
            className="rounded-circle"
            id="dropdownUser"
          >
            <div className="avatar avatar-md avatar-indicators avatar-online">
              {user?.avatar ? (
                <Image
                  alt="avatar"
                  src={user.avatar}
                  className="rounded-circle"
                  width={100}
                  height={100}
                />
              ) : (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center  text-white fw-bold"
                  style={{
                    width: "40px",
                    height: "40px",
                    fontSize: "16px",
                    fontFamily: "sans-serif",
                     backgroundColor: "#A22191",
                     color: "#fff" 
                  }}
                >
                  {getInitials(user.name)}
                </div>
              )}
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu
            className="dropdown-menu dropdown-menu-end shadow-lg"
            align="end"
            style={{ minWidth: "280px" }}
          >
            {/* User Profile Section */}
            <Dropdown.Item as="div" className="px-2 pb-0 pt-3" bsPrefix=" ">
              <div className="d-flex align-items-center mb-2">
                <div className="me-3">
                  <div className="avatar avatar-md">
                    {user?.avatar ? (
                      <Image
                        alt="avatar"
                        src={user.avatar}
                        className="rounded-circle"
                        width={100}
                        height={100}
                      />
                    ) : (
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center  text-white fw-bold"
                        style={{
                          width: "40px",
                          height: "40px",
                          fontSize: "16px",
                          fontFamily: "sans-serif",
                          backgroundColor: "#A22191",
                          color: "#fff" 
                        }}
                      >
                        {getInitials(user.name)}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h5 className="mb-0 fw-semibold">{user.name}</h5>
                  <p className="text-muted mb-0 small">{user.email}</p>
                </div>
              </div>
              <div className="dropdown-divider my-3"></div>
            </Dropdown.Item>

            {/* Menu Items with Icons */}
            <div className="px-1">
              {hasPermission("monitoring") && (
                <Dropdown.Item
                  as={Link}
                  href={`/${prefix}/monitor`}
                  className="d-flex align-items-center py-2 px-2 rounded-2 mb-1 text-decoration-none"
                >
                  <FiMonitor className="me-3" style={{ color: "#A22191" }} size={18} />
                  <span>Monitoring</span>
                  <FiChevronRight className="ms-auto text-muted" size={16} />
                </Dropdown.Item>
              )}

              {hasPermission("payment") && (
                <Dropdown.Item
                  as={Link}
                  href={`/${prefix}/payment`}
                  className="d-flex align-items-center py-2 px-2 rounded-2 mb-1 text-decoration-none"
                >
                  <FiCreditCard className="me-3" style={{ color: "#A22191" }} size={18} />
                  <span>Payment History & Invoices</span>
                  <FiChevronRight className="ms-auto text-muted" size={16} />
                </Dropdown.Item>
              )}

              {hasPermission("manage-help-desk") && (
                <Dropdown.Item
                  as={Link}
                  href={`/${prefix}/manage-helpdesk`}
                  className="d-flex align-items-center py-2 px-2 rounded-2 mb-1 text-decoration-none"
                >
                  <FiHelpCircle className="me-3" style={{ color: "#A22191" }} size={18} />
                  <span>Manage Helpdesk</span>
                  <FiChevronRight className="ms-auto text-muted" size={16} />
                </Dropdown.Item>
              )}

              {hasPermission("manage-api-logs") && (
                <Dropdown.Item
                  as={Link}
                  href={`/${prefix}/manage-api-logs`}
                  className="d-flex align-items-center py-2 px-2 rounded-2 mb-1 text-decoration-none"
                >
                  <FiDatabase className="me-3" style={{ color: "#A22191" }} size={18} />
                  <span>API Requests</span>
                  <FiChevronRight className="ms-auto text-muted" size={16} />
                </Dropdown.Item>
              )}

              {hasPermission("response-message") && (
                <Dropdown.Item
                  as={Link}
                  href={`/${prefix}/response-message`}
                  className="d-flex align-items-center py-2 px-2 rounded-2 mb-1 text-decoration-none"
                >
                  <FiMessageSquare className="me-3" style={{ color: "#A22191" }} size={18} />
                  <span>Response Message</span>
                  <FiChevronRight className="ms-auto text-muted" size={16} />
                </Dropdown.Item>
              )}
            </div>

            {/* Sign Out Section */}
            <div className="px-2">
              {prefix != "brand" && (
                <div className="dropdown-divider my-2"></div>
              )}

              <Dropdown.Item
                onClick={handleSignOut}
                className="d-flex align-items-center py-2 px-2 rounded-2 text-decoration-none bg-light-hover"
              >
                <FiPower className="me-3 text-danger" size={18} />
                <span className="text-danger">Sign Out</span>
              </Dropdown.Item>
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </ListGroup>
    );
  };

  return <Fragment>{hasMounted && <QuickMenuContent />}</Fragment>;
};

export default QuickMenu;
