import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserGraduate, FaChalkboardTeacher, FaUsers, FaChartLine, FaClipboardCheck, FaMoneyBillWave, FaSchool } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:5000/api';

// Component to display the live statistics in cards
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`p-5 rounded-xl shadow-lg border border-gray-200 ${color}`}>
        <div className="flex items-center justify-between">
            <Icon className="text-4xl opacity-75" />
            <span className="text-3xl font-extrabold">{typeof value === 'number' ? value.toLocaleString() : value}</span>
        </div>
        <p className="mt-3 text-sm font-medium">{title}</p>
    </div>
);

export default function DashboardHome() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch consolidated stats from the fees controller
                const summaryRes = await axios.get(`${API_BASE_URL}/fees/summary`, { headers });
                
                // Process the data into the structure needed for cards
                const fetchedStats = [
                    { title: "Total Classes", value: summaryRes.data.totalClasses, icon: FaSchool, color: "bg-purple-100 text-purple-800" },
                    { title: "Total Teachers", value: summaryRes.data.totalTeachers, icon: FaChalkboardTeacher, color: "bg-green-100 text-green-800" },
                    { title: "Total Students", value: summaryRes.data.totalStudents, icon: FaUserGraduate, color: "bg-blue-100 text-blue-800" },
                    { title: "Active Parents", value: summaryRes.data.totalParents, icon: FaUsers, color: "bg-yellow-100 text-yellow-800" },
                    { title: "Fees Collected", value: `₹${(summaryRes.data.totalAmountPaid || 0).toFixed(2)}`, icon: FaMoneyBillWave, color: "bg-teal-100 text-teal-800" },
                    { title: "Fees Pending", value: `₹${(summaryRes.data.totalPendingAmount || 0).toFixed(2)}`, icon: FaMoneyBillWave, color: "bg-red-100 text-red-800" },
                ];
                setStats(fetchedStats);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch dashboard summary.');
                setLoading(false);
            }
        };
        fetchStats();
    }, [token]);

    const quickLinks = [
        { name: "Manage Classes", link: "/admin/dashboard/myclasses", color: "bg-orange-500" },
        { name: "Add New Teacher", link: "/admin/dashboard/teachers", color: "bg-teal-500" },
        { name: "View Reports", link: "/admin/dashboard/results/view", color: "bg-blue-500" },
        { name: "Send Announcement", link: "/admin/dashboard/announcements", color: "bg-pink-500" },
    ];

    if (loading) return <p className="text-center p-8">Loading School Overview...</p>;
    if (error) return <p className="text-red-500 p-4">Error: {error}</p>;

    return (
        <div className="dashboard-home p-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">School Overview (Live Data)</h3>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Quick Actions */}
            <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickLinks.map((link) => (
                    <a key={link.name} href={link.link} className={`p-4 rounded-lg shadow-md text-white font-semibold text-center ${link.color} hover:shadow-xl transition duration-200`}>
                        {link.name}
                    </a>
                ))}
            </div>
        </div>
    );
}