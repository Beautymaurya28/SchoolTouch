import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './dashboard.css'; // Renamed and shared CSS file

export default function ParentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        role="parent"
        className={sidebarOpen ? "sidebar open" : "sidebar"}
        onClose={toggleSidebar}
      />
      
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <div className="main-content">
        <div className="top-navbar">
          <button onClick={toggleSidebar} className="hamburger-btn">
            ☰
          </button>
          <h1 className="dashboard-title">Parent Dashboard</h1>
        </div>
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}