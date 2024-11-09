import Link from "next/link";
import React from "react";
import {
  FaHome,
  FaUsers,
  FaCog,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa"; // Import react-icons

export default function Header() {
  return (
    <div
      className="bg-dark text-white"
      style={{ width: "250px", height: "100vh" }}
    >
      <div className="d-flex justify-content-center align-items-center p-4">
        <h2 className="text-center">Admin L&F</h2>
      </div>

      <div className="list-group">
        <Link
          href="/admin/"
          className="list-group-item list-group-item-action "
        >
          <FaHome className="me-2" /> Dashboard
        </Link>
        <Link
          href="/admin/users"
          className="list-group-item list-group-item-action "
        >
          <FaUsers className="me-2" /> Users
        </Link>
        <Link
          href="/admin/settings"
          className="list-group-item list-group-item-action "
        >
          <FaCog className="me-2" /> Settings
        </Link>
        <Link
          href="/admin/reports"
          className="list-group-item list-group-item-action "
        >
          <FaChartBar className="me-2" /> Reports
        </Link>
      </div>
    </div>
  );
}
