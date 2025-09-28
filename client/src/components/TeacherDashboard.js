import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import './dashboard.css'; // Renamed and shared CSS file

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Added state for sidebar

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      const token = localStorage.getItem('token');
      const profileId = localStorage.getItem('profileId');
      const headers = { Authorization: `Bearer ${token}` };

      if (!profileId || !token) {
        setError('User not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/teachers/${profileId}`, { headers });
        setTeacher(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch teacher profile.');
        setLoading(false);
      }
    };
    fetchTeacherProfile();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!teacher) return <p>Teacher profile not found.</p>;

  return (
    <div className="dashboard-container">
      <Sidebar
        role="teacher"
        isClassTeacher={teacher.isClassTeacher}
        className={sidebarOpen ? "sidebar open" : "sidebar"}
        onClose={toggleSidebar}
      />
      
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <div className="main-content">
        <div className="top-navbar">
          <button onClick={toggleSidebar} className="hamburger-btn">
            ☰
          </button>
          <h1 className="dashboard-title">Welcome, {teacher.name}!</h1>
        </div>
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}