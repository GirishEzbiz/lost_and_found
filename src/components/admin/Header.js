import Link from "next/link";
import React from "react";
import {
  FaHome,
  FaUsers,
  FaCog,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa"; // Import react-icons

export default function Sidebar({ session, signOut }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <p>Welcome, {session ? session.user.email : ""}</p>
          </li>
          <li className="nav-item">
            {session ? (
              <button className="btn btn-danger" onClick={() => signOut()}>
                <FaSignOutAlt className="me-2" /> Logout
              </button>
            ) : (
              <Link href="/admin/login" className="nav-link">
                Login
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
