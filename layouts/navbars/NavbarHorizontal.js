import Link from "next/link";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import { DashboardMenu } from "routes/DashboardRoutes";
import QuickMenu from "layouts/QuickMenu";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "node_modules/axios";
import Image from "next/image";
import { getAdminDetail } from "lib/getAdminDetail";

const NavbarHorizontal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prefix, setPrefix] = useState("admin"); // Default prefix
  const [user, setUser] = useState(null);


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
    if (typeof window !== "undefined") {
      const data = getAdminDetail();
      setUser(data);
    }
  }, []);







  // Permission-based rendering
  const hasPermission = (permission) =>
    user?.permissions?.includes(permission);

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

            {/* Masters Dropdown */}
            {hasPermission("masters") && (
              <NavDropdown
                title="Masters"
                id="nav-dropdown"
                renderMenuOnMount={true}
              >
                {hasPermission("Category Master") && (
                  <Link
                    href={`/${prefix}/categories`}
                    className="dropdown-item"
                  >
                    Category Master
                  </Link>
                )}
                {hasPermission("Category Master") && (
                  <Link
                    href={`/${prefix}/item-categories`}
                    className="dropdown-item"
                  >
                    Item Category Master
                  </Link>
                )}
                {hasPermission("Subcategory Master") && (
                  <Link
                    href={`/${prefix}/subcategories`}
                    className="dropdown-item"
                  >
                    Subcategory Master
                  </Link>
                )}
                {hasPermission("brands") && (
                  <Link href={`/${prefix}/brands`} className="dropdown-item">
                    Brands Master
                  </Link>
                )}
                {user?.role == 0 ||
                  (hasPermission("SKU Master") && (
                    <Link
                      href={`/${prefix}/sku-master`}
                      className="dropdown-item"
                    >
                      Sku Master
                    </Link>
                  ))}
              </NavDropdown>
            )}

            {(user?.role == 0 ||
              hasPermission("templates") ||
              hasPermission("batches") ||
              hasPermission("Qr Manager")) && (
                <NavDropdown
                  title="QR Management"
                  id="qr-code-dropdown"
                  renderMenuOnMount={true}
                >
                  {(user?.role == 0 || hasPermission("templates")) && (
                    <Link
                      href={`/${prefix}/code-mining`}
                      className="dropdown-item"
                    >
                      {user.brand_id != null ? "Code Batches" : "Templates"}
                    </Link>
                  )}
                  {(user?.role == 0 || hasPermission("batches")) && (
                    <Link href={`/${prefix}/batchs`} className="dropdown-item">
                      System Batch
                    </Link>
                  )}
                  {(user?.role == 0 || hasPermission("code-ledgers")) && (
                    <Link href={`/${prefix}/code-ledger`} className="dropdown-item">
                      Code Ledgers
                    </Link>
                  )}
                  {(user?.role == 0 || hasPermission("psudo-random-code")) && (
                    <Link
                      href={`/${prefix}/psudo-random-code`}
                      className="dropdown-item"
                    >
                      Psudo Random Code
                    </Link>
                  )}
                  <Link href={`/${prefix}/scanReports`} className="dropdown-item">
                    Scan Reports{" "}
                  </Link>
                </NavDropdown>
              )}

            {/* {(user?.role == 12 || hasPermission("payment")) && (
              <Link href={`/${prefix}/payment`} className="nav-link">
                Payment History & Invoices
              </Link>
            )} */}

            {(user?.role !== 12 || hasPermission("registrations")) ? (
              <Link href={`/${prefix}/registrations`} className="nav-link">
                Registrations
              </Link>
            ) : null}
            {/* {(user?.role !== 12 || hasPermission("blogs")) ? (
              <Link href={`/${prefix}/blogs`} className="nav-link">
                Blogs
              </Link>
            ) : null} */}
            {(user?.role !== 12 || hasPermission("finder-owner-communication")) ? (
              <Link href={`/${prefix}/finder-owner-communication`} className="nav-link">
                Finder-Owner 
              </Link>
            ) : null}

            {/* {(user?.role !== 12 || hasPermission("manage-help-desk")) ? (
              <Link href={`/${prefix}/manage-helpdesk`} className="nav-link">
                Manage Helpdesk
              </Link>
            ) : null}
              {(user?.role !== 12 || hasPermission("manage-api-logs")) ? (
              <Link href={`/${prefix}/manage-api-logs`} className="nav-link">
                Api Requests
              </Link>
            ) : null} */}

            {(user?.role == 0 || hasPermission("reports")) && (
              <NavDropdown
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
                 <Link
                  href={`/${prefix}/email-whatsapp-delivery`}
                  className="dropdown-item"
                >
                  Email & WhatsApp Delivery Logs
                </Link>
                 <Link
                  href={`/${prefix}/brand-wise-count`}
                  className="dropdown-item"
                >
                 Brand Wise Count
                </Link>
                <Link
                  href={`/${prefix}/finder-page`}
                  className="dropdown-item"
                >
                  Finders Data
                </Link>
                <Link
                  href={`/${prefix}/reports/contactReport`}
                  className="dropdown-item"
                >
                  Contact Report
                </Link>
              </NavDropdown>
            )}

            {(user?.role == 0 ||
              (user?.role_name === "Super admin" && hasPermission("teams"))) &&
              user.brand_id == null && (
                <Link href={`/${prefix}/teams`} className="nav-link">
                  Team
                </Link>
              )}
            {(user?.brand_id == null &&
              (user?.role === 12 || hasPermission("error-logs"))) && (
                <Link href={`/${prefix}/error-logs`} className="nav-link">
                  Logs
                </Link>
              )}

          </Nav>

          {/* Quick Menu */}
          <div className="navbar-nav">
            <QuickMenu />
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

export default NavbarHorizontal;
