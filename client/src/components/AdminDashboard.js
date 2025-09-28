import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./admin.css";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar component with dynamic class for mobile responsiveness */}
      <Sidebar
        role="admin"
        className={sidebarOpen ? "sidebar open" : "sidebar"}
        onClose={toggleSidebar} // Pass the close function to the Sidebar
      />

      {/* Overlay to close the sidebar on mobile click */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* Main content area */}
      <div className="main-content">
        {/* Top Navbar */}
        <div className="top-navbar">
          {/* Hamburger button is always visible */}
          <button onClick={toggleSidebar} className="hamburger-btn">
            ☰
          </button>
          <h1 className="dashboard-title">Admin Dashboard</h1>
        </div>

        {/* This is where the nested route content will be rendered */}
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}