
import { Fragment, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMediaQuery } from "react-responsive";
import {
  ListGroup,
  Accordion,
  Card,
  Badge,
  useAccordionButton,
  AccordionContext,
} from "react-bootstrap";
import Image from "next/image";
// import simple bar scrolling used for notification item scrolling
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";

// import routes file
import { DashboardMenu } from "routes/DashboardRoutes";


import { getAdminDetail } from "lib/getAdminDetail";
const NavbarVertical = () => {
  const [prefix, setPrefix] = useState("admin");
  const [user, setUser] = useState(null);
  const [openMenus, setOpenMenus] = useState({
    masters: false,
    qr: false,
    reports: false,
  });

  useEffect(() => {
    const userKind = localStorage.getItem("user_kind");
    setPrefix(userKind === "bt" ? "brand" : "admin");
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = getAdminDetail();
      setUser(data);
    }
  }, []);

  const hasPermission = (permission) => user?.permissions?.includes(permission);
  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="navbar-vertical d-flex flex-column vh-100">
      {/* Logo */}
      <div className="logo-container text-center border-bottom py-3">
        <Link href={`/${prefix}`} className="navbar-brand d-block">
          <Image
            src="/assets/new_qritagya_logo.png"
            alt="Lost and Found Logo"
            width={160}
            height={5}
            style={{ height: "40px " }}
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <div className="nav flex-column p-2 gap-1">
        <Link href={`/${prefix}`} className="nav-link custom-nav-link text-white">
          Dashboard
        </Link>

        {/* Masters Accordion */}
        {hasPermission("masters") && (
          <>
            <div className="accordion-header" onClick={() => toggleMenu("masters")}>
              Masters
              <span className={`arrow ${openMenus.masters ? "rotate" : ""}`}>▶</span>
            </div>
            <div className={`accordion-body ${openMenus.masters ? "open" : ""}`}>
              {hasPermission("Category Master") && (
                <>
                  <Link href={`/${prefix}/categories`} className="dropdown-item drp-item text-white">Category Master</Link>
                  <Link href={`/${prefix}/item-categories`} className="dropdown-item drp-item text-white">Item Category Master</Link>
                </>
              )}
              {hasPermission("Subcategory Master") && (
                <Link href={`/${prefix}/subcategories`} className="dropdown-item drp-item text-white">Subcategory Master</Link>
              )}
              {hasPermission("brands") && (
                <Link href={`/${prefix}/brands`} className="dropdown-item drp-item text-white">Brands Master</Link>
              )}
              {(user?.role === 0 || hasPermission("SKU Master")) && (
                <Link href={`/${prefix}/sku-master`} className="dropdown-item drp-item text-white">SKU Master</Link>
              )}
            </div>
          </>
        )}

        {/* QR Management Accordion */}
        {(user?.role === 0 || hasPermission("Qr Manager")) && (
          <>
            <div className="accordion-header" onClick={() => toggleMenu("qr")}>
              QR Management
              <span className={`arrow ${openMenus.qr ? "rotate" : ""}`}>▶</span>
            </div>
            <div className={`accordion-body ${openMenus.qr ? "open" : ""}`}>
              <Link href={`/${prefix}/code-mining`} className="dropdown-item drp-item text-white">
                {user?.brand_id ? "Code Batches" : "Templates"}
              </Link>
              <Link href={`/${prefix}/batchs`} className="dropdown-item drp-item text-white">System Batch</Link>
              <Link href={`/${prefix}/code-ledger`} className="dropdown-item drp-item text-white">Code Ledgers</Link>
              <Link href={`/${prefix}/psudo-random-code`} className="dropdown-item drp-item text-white">Psudo Random Code</Link>
              <Link href={`/${prefix}/scanReports`} className="dropdown-item drp-item text-white">Scan Reports</Link>
            </div>
          </>
        )}

        {/* Registrations */}
        {(user?.role !== 12 || hasPermission("registrations")) && (
          <Link href={`/${prefix}/registrations`} className="nav-link custom-nav-link text-white">Registrations</Link>
        )}

        {/* Blogs */}
        {/* {(user?.role !== 12 || hasPermission("blogs")) && (
          <Link href={`/${prefix}/blogs`} className="nav-link custom-nav-link text-white">Blogs</Link>
        )} */}

        {/* Finder Owner Communication */}
        {(user?.role !== 12 || hasPermission("finder-owner-communication")) && (
          <Link
            href={`/${prefix}/finder-owner-communication`}
            className="nav-link custom-nav-link text-white"
          >
            Finder-Owner
          </Link>
        )}

        {/* Reports Accordion */}
        {(user?.role === 0 || hasPermission("reports")) && (
          <>
            <div className="accordion-header" onClick={() => toggleMenu("reports")}>
              Reports
              <span className={`arrow ${openMenus.reports ? "rotate" : ""}`}>▶</span>
            </div>
            <div className={`accordion-body ${openMenus.reports ? "open" : ""}`}>
              <Link href={`/${prefix}/reports/totalUserRegister`} className="dropdown-item drp-item text-white">Total User Registrations</Link>
              <Link href={`/${prefix}/reports/lostAndFound`} className="dropdown-item drp-item text-white">Lost And Found Overview</Link>
              <Link href={`/${prefix}/reports/utilizationRate`} className="dropdown-item drp-item text-white">QR Code Utilization</Link>
              <Link href={`/${prefix}/reports/lostItem`} className="dropdown-item drp-item text-white">Lost & Found Trends</Link>
              <Link href={`/${prefix}/reports/userGrowth`} className="dropdown-item drp-item text-white">User Growth</Link>
              <Link href={`/${prefix}/reports/engagementInsight`} className="dropdown-item drp-item text-white">Engagement Insights</Link>
              <Link href={`/${prefix}/reports/geoTrend`} className="dropdown-item drp-item text-white">Geo Trend</Link>
              <Link href={`/${prefix}/email-whatsapp-delivery`} className="dropdown-item drp-item text-white"> Email & WhatsApp Logs</Link>
              <Link href={`/${prefix}/brand-wise-count`} className="dropdown-item drp-item text-white">Brand Wise Count</Link>
              <Link href={`/${prefix}/finder-page`} className="dropdown-item drp-item text-white">Finders Data</Link>
              <Link href={`/${prefix}/reports/contactReport`} className="dropdown-item drp-item text-white">Contact Report</Link>
            </div>
          </>
        )}

        {/* Team */}
        {(user?.role === 0 || (user?.role_name === "Super admin" && hasPermission("teams"))) &&
          !user?.brand_id && (
            <Link href={`/${prefix}/teams`} className="nav-link custom-nav-link text-white">Team</Link>
          )}

        {/* Logs */}
        {(user?.brand_id == null && (user?.role === 12 || hasPermission("error-logs"))) && (
          <Link href={`/${prefix}/error-logs`} className="nav-link custom-nav-link text-white">Logs</Link>
        )}
      </div>

      {/* **Critical Fix: Global CSS Override (Add this in your global CSS file or _app.js) */}
      <style jsx global>{`
        /* **Force override Bootstrap's dropdown-item styling** */
        .navbar-vertical .dropdown-item,
        .navbar-vertical .drp-item {
          background-color: transparent !important;
          color: #f1f5f9 !important;
          border: none !important;
        }

        .navbar-vertical .dropdown-item:hover,
        .navbar-vertical .drp-item:hover {
          background-color: #2c3a4b !important;
          color: #f1f5f9 !important;
        }

        /* **Prevent Bootstrap's active/focus states from overriding** */
        .navbar-vertical .dropdown-item:focus,
        .navbar-vertical .dropdown-item.active,
        .navbar-vertical .drp-item:focus,
        .navbar-vertical .drp-item.active {
          background-color: transparent !important;
          color: #f1f5f9 !important;
        }
      `}</style>

      {/* **Component-Specific Styling** */}
      <style jsx>{`
        .navbar-vertical {
          background-color: #212b36;
          color: #f1f5f9;
          width: 250px;
          z-index: 1050;
        }

        .nav-link,
        .accordion-header {
          color: #f1f5f9 !important;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
          cursor: pointer;
          text-decoration: none;
          border-radius: 6px;
          transition: background 0.3s;
          background-color: transparent !important;
        }

        .nav-link:hover,
        .accordion-header:hover {
          background-color: #2c3a4b !important;
        }

        .accordion-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .accordion-body.open {
          max-height: 1000px;
        }

        .dropdown-item,
        .drp-item {
          display: block;
          padding: 0.4rem 1.5rem;
          font-size: 0.95rem;
          text-decoration: none;
          color: #f1f5f9 !important;
          background-color: transparent !important;
          border-radius: 4px;
          margin: 2px 0;
        }

        .dropdown-item:hover,
        .drp-item:hover {
          background-color: #2c3a4b !important;
          text-decoration: none !important;
        }

        .arrow {
          transition: transform 0.3s ease;
        }

        .arrow.rotate {
          transform: rotate(90deg);
        }
      `}</style>
    </div>
  );
};

export default NavbarVertical;