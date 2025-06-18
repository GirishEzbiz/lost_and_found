import Link from "next/link";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import { DashboardMenu } from "routes/DashboardRoutes";
import QuickMenu from "layouts/QuickMenu";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "node_modules/axios";
import Image from "next/image";
import { getAdminDetail } from "lib/getAdminDetail";

const BrandNavHorizontal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenData, setTokenData] = useState();
  const [userData, setUserData] = useState();
  const [prefix, setPrefix] = useState("admin"); // Default prefix
  const [isMounted, setIsMounted] = useState(false);

  // Fetch the prefix based on the userkind from localStorage
  useEffect(() => {
    const userKind = localStorage.getItem("user_kind");
    if (userKind === "bt") {
      setPrefix("brand");
    } else {
      setPrefix("admin");
    }
  }, []);


useEffect(() => {
  setIsMounted(true);
}, [])

  function decodeJWT(token) {
    try {
      const base64Url = token.split(".")[1]; // Get the payload part of the JWT
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Replace URL-safe characters
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload); // Return the parsed JSON payload
    } catch (error) {
      console.log("error fetching token", error);
      return null; // Return null if decoding fails
    }
  }

  useEffect(() => {
    setTokenData(decodeJWT(Cookies.get("adminToken")));
  }, []);



  if (!isMounted) return null;

  

  let userrr = getAdminDetail()

  // Permission-based rendering
  const hasPermission = (permission) =>
    userrr?.permissions?.includes(permission);


  return (
    <Navbar
      expanded="lg"
      className="bg-white"
      style={{ borderBottom: "1px solid #e2e8f0" }}
    >
      <div className="container-fluid w-100">
        <div className="d-flex justify-content-between align-items-center w-100">
          {/* Logo */}
          <Link href={`/${prefix}`} className="navbar-brand">
            <Image
              src="/assets/new_qritagya_logo.png" // Correct path (no ./)
              alt="Lost and Found Logo"
              width={75} // Required width
              height={70} // Required height
              priority // Optional: Ensures the image loads faster
            />
          </Link>

          {/* Navigation */}
          <Nav className="mx-auto gap-3">
            <Link href={`/${prefix}`} className="nav-link">
              Dashboard
            </Link>

            <Link href={`/${prefix}/registrations`} className="nav-link">
              Registrations
            </Link>

            <Link href={`/${prefix}/code-management`} className="nav-link">
              Code Management
            </Link>

            <Link href={`/${prefix}/payment`} className="nav-link">
              Transactions
            </Link>

            <NavDropdown
              title="Reports"
              id="nav-dropdown-reports"
              renderMenuOnMount={true}
            >
              {hasPermission("view_reports") ? (
                <>
                  <Link
                    href={`/${prefix}/reports/totalUserRegister`}
                    className="dropdown-item"
                  >
                    Total User Registrations
                  </Link>
                  <Link
                    href={`/${prefix}/reports/lostAndFound`}
                    className="dropdown-item"
                  >
                    Lost And Found Overview
                  </Link>
                  <Link
                    href={`/${prefix}/reports/utilizationRate`}
                    className="dropdown-item"
                  >
                    QR Code Utilization
                  </Link>
                  <Link
                    href={`/${prefix}/reports/lostItem`}
                    className="dropdown-item"
                  >
                    Lost & Found Trends Over Time
                  </Link>
                  <Link
                    href={`/${prefix}/reports/userGrowth`}
                    className="dropdown-item"
                  >
                    User Growth Over Time
                  </Link>
                  <Link
                    href={`/${prefix}/reports/engagementInsight`}
                    className="dropdown-item"
                  >
                    Engagement Insights
                  </Link>
                  <Link
                    href={`/${prefix}/reports/geoTrend`}
                    className="dropdown-item"
                  >
                    Geo Trend
                  </Link>
                </>
              ) : (
                <span className="dropdown-item text-muted">
                  You don't have permission to view reports
                </span>
              )}



            </NavDropdown>



            {/* <NavDropdown
              title="Reports"
              id="nav-dropdown-reports"
              renderMenuOnMount={true}
            >
              <Link
                href={`/${prefix}/reports/totalUserRegister`}
                className="dropdown-item"
              >
                Total User Registrations
              </Link>
              <Link
                href={`/${prefix}/reports/lostAndFound`}
                className="dropdown-item"
              >
                Lost And Found Overview{" "}
              </Link>
              <Link
                href={`/${prefix}/reports/utilizationRate`}
                className="dropdown-item"
              >
                QR Code Utilization{" "}
              </Link>
              <Link
                href={`/${prefix}/reports/lostItem`}
                className="dropdown-item"
              >
                Lost & Found Trends Over Time
              </Link>
              <Link
                href={`/${prefix}/reports/userGrowth`}
                className="dropdown-item"
              >
                User Growth Over Time
              </Link>
              <Link
                href={`/${prefix}/reports/engagementInsight`}
                className="dropdown-item"
              >
                Engagement Insights
              </Link>
              <Link
                href={`/${prefix}/reports/geoTrend`}
                className="dropdown-item"
              >
                Geo Trend
              </Link>
            </NavDropdown> */}
          </Nav>

          {/* Quick Menu */}
          <div className="navbar-nav">
            <QuickMenu type="brand" />
          </div>
        </div>
      </div>

      <style jsx global>
    {`

/* Hover state */
.dropdown-item:hover {
  color: #a22191 !important;
    background-color: #FEF7FF !important;
}

/* Selected/Clicked state (permanent after click) */
.dropdown-item.active,
.dropdown-item:active:focus,  /* Remove Bootstrap's click flash */
.dropdown-item:focus {
  color: #a22191 !important;
  background-color: #FEF7FF !important;
  
 
}
    `}
  </style>
      
    </Navbar>
  );
};

export default BrandNavHorizontal;
