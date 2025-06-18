// components/TopNav.js
import Image from "next/image";
import { useState } from "react";

const TopNav = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleSidebar}
        >
          ☰
        </button>
        <span className="navbar-brand">Lost & Found</span>
        <div className="ml-auto">
          <Image
            src="https://randomuser.me/api/portraits/men/1.jpg"
            alt="Profile"
            className="rounded-circle"
            style={{ width: 40, height: 40 }}
          />
        </div>
      </nav>

      {/* Sidebar */}
      {sidebarVisible && (
        <div className="sidebar">
          <ul>
            <li>Dashboard</li>
            <li>Manage Items</li>
            <li>Settings</li>
            <li>Logout</li>
          </ul>
        </div>
      )}
    </>
  );
};

export default TopNav;
