import React from "react";
import { NavLink } from "react-router-dom";
// Assuming you have a CSS file for styling
// import "./admin.css"; 

// Universal Logout Handler
const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
        // Clear all session/auth data from the browser
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("profileId"); 
        
        // Redirect to the login page (root path)
        window.location.href = "/"; 
    }
};

export default function Sidebar({ role, className, onClose }) {
  // Define active/inactive classes for visual clarity (assuming they are defined in your admin.css)
  const activeClass = "block py-2.5 px-4 rounded transition duration-200 bg-blue-600 text-white";
  const inactiveClass = "block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-600 hover:text-white text-gray-200";

  const getLinks = () => {
    switch (role) {
      case "admin":
        return [
          { to: "/admin/dashboard", name: "Dashboard" },
          { to: "/admin/dashboard/myclasses", name: "Manage Classes & Schedule" },
          { to: "/admin/dashboard/teachers", name: "Manage Teachers" },
          { to: "/admin/dashboard/students", name: "Manage Students" },
          { to: "/admin/dashboard/parents", name: "Manage Parents" },
          { to: "/admin/dashboard/subjects", name: "Manage Subjects" },
          { to: "/admin/dashboard/exams", name: "Exams" },
          { to: "/admin/dashboard/results/view", name: "View Results" },
          { to: "/admin/dashboard/results/publish", name: "Publish Results" },
          { to: "/admin/dashboard/attendance", name: "Attendance Reports" },
          { to: "/admin/dashboard/fees", name: "Fees Management" },
          { to: "/admin/dashboard/announcements", name: "Announcements" },
          { to: "/admin/dashboard/profile", name: "Profile" },
          { to: "/admin/dashboard/timetables-and-schedule", name: "Manage Timetable & Schedule" },
        ];

      case "teacher":
        const teacherLinks = [
          { to: "/teacher/dashboard", name: "Dashboard Home" },
          { to: "/teacher/dashboard/myclass", name: "My Class & Students" }, // My Class info page
          // Attendance is sensitive, placing it high up
          // { to: "/teacher/dashboard/attendance", name: "Mark Attendance" }, // Will be added by logic outside this function
          { to: "/teacher/dashboard/timetable-and-schedule", name: "My Timetable & Schedule" },
          { to: "/teacher/dashboard/results", name: "Submit Results" },
          { to: "/teacher/dashboard/unit-tests", name: "Create Unit Test" },
 { to: "/teacher/dashboard/homework-and-materials", name: "Homework & Study Materials" },
          { to: "/teacher/dashboard/announcements", name: "Announcements" },
          { to: "/teacher/dashboard/chat", name: "Parent Chat" },
          { to: "/teacher/dashboard/profile", name: "Profile" },
        ];
        return teacherLinks;

      case "student":
        return [
          { to: "/student/dashboard", name: "Dashboard Home" },
          { to: "/student/dashboard/myclass", name: "My Class & Students" },
          { to: "/student/dashboard/attendance", name: "My Attendance" },
          { to: "/student/dashboard/results", name: "My Results" },
          { to: "/student/dashboard/exam-timetable", name: "My Exam Timetable" },
          { to: "/student/dashboard/homework-and-materials", name: "Homework & Study Materials" },
          { to: "/student/dashboard/fees", name: "Fees Dashboard" },
          { to: "/student/dashboard/library", name: "Library" },
          { to: "/student/dashboard/announcements", name: "Announcements" },
          { to: "/student/dashboard/profile", name: "Profile" },
          { to: "/student/dashboard/timetables-and-schedule", name: "My Timetable & Schedule" },
        ];

      case "parent":
        return [
          { to: "/parent/dashboard", name: "Dashboard Home" },
          { to: "/parent/dashboard/myclass", name: "My Class & Students" },
          { to: "/parent/dashboard/attendance", name: "Attendance" },
          { to: "/parent/dashboard/results", name: "Results" },
          { to: "/parent/dashboard/exam-timetable", name: "Child’s Exam Timetable" },
          { to: "/parent/dashboard/fees", name: "Fees Dashboard" },
          { to: "/parent/dashboard/homework-and-materials", name: "Homework & Study Materials" },
          { to: "/parent/dashboard/chat", name: "Teacher Chat" },
          { to: "/parent/dashboard/announcements", name: "Announcements" },
          { to: "/parent/dashboard/profile", name: "Profile" },
          { to: "/parent/dashboard/timetables-and-schedule", name: "My Timetable & Schedule" }, // Removed duplicate
        ];

      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className={className}>
      <div className="sidebar-header">
        <div className="sidebar-brand">SchoolTouch</div>
        <button onClick={onClose} className="sidebar-close-btn">
          &times;
        </button>
      </div>
      <nav>
        <ul>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === `/${role}/dashboard`}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {link.name}
              </NavLink>
            </li>
          ))}
          {/* LOGOUT BUTTON - Placed outside the map for uniqueness and consistency */}
          <li className="sidebar-logout-item">
             <button onClick={handleLogout} className="logout-btn">
                Log Out
             </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}