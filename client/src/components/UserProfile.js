import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaSave, FaUser, FaLock } from 'react-icons/fa';

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/profile`, { headers });
      setProfile(res.data);
      setFormData(res.data.details); // Initialize form data with fetched details
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch profile data.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_BASE_URL}/profile`, formData, { headers });
      setMessage(res.data.message);
      setIsEditMode(false);
      fetchProfile(); // Re-fetch data to update UI
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
        localStorage.clear(); // Clear all user data
        window.location.href = "/";
    }
};

  if (loading) return <p className="text-center p-8">Loading Profile...</p>;
  if (error) return <p className="text-center p-8 text-red-500">Error: {error}</p>;
  if (!profile) return <p className="text-center p-8">Profile data not available.</p>;

  // Function to render role-specific fields
  const renderDetails = () => {
    const details = profile.details;
    const base = profile.baseInfo;

    const data = [
        { label: "Role", value: base.role.toUpperCase(), icon: 'FaUser' },
        { label: "Email", value: base.email, icon: 'FaEnvelope' },
        { label: "Full Name", value: details.name || base.name, icon: 'FaUser' },
        { label: "Phone", value: details.phone || 'N/A', icon: 'FaPhone' },
        { label: "Address", value: details.address || 'N/A', icon: 'FaMapMarkerAlt' },
    ];
    
    // Teacher Specific
    if (role === 'teacher') {
        data.push({ label: "Class Assigned", value: `${details.assignedClass?.className} ${details.assignedClass?.section || ''}` || 'N/A', icon: 'FaSchool' });
        data.push({ label: "Subjects", value: details.assignedSubjects?.map(s => s.subjectName).join(', ') || 'N/A', icon: 'FaBook' });
    }

    // Student Specific
    if (role === 'student') {
        data.push({ label: "Class & Section", value: `${details.class?.className} ${details.class?.section || ''}` || 'N/A', icon: 'FaSchool' });
        data.push({ label: "Roll Number", value: details.rollNumber || 'N/A', icon: 'FaIdCard' });
        data.push({ label: "Parent Contact", value: `${details.parent?.name} (${details.parent?.phone})` || 'N/A', icon: 'FaUsers' });
        data.push({ label: "Attendance Avg", value: profile.analytics?.attendance || 'N/A', icon: 'FaCheckCircle' });
    }
    
    // Parent Specific - Child List
    if (role === 'parent') {
        data.push({ label: "Children", value: details.children?.map(c => `${c.name} (${c.class?.className || 'N/A'})`).join('; ') || 'N/A', icon: 'FaChild' });
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((item, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-center">
                    <span className="font-semibold text-gray-700">{item.label}:</span>
                    <span className="ml-2 text-gray-800">{item.value}</span>
                </div>
            ))}
        </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <FaUser className="mr-2 text-orange-600" /> My Profile
      </h2>
      
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <h3 className="text-xl font-semibold">
            {profile.details.name || profile.baseInfo.name} - {profile.baseInfo.role.toUpperCase()}
          </h3>
          <button 
            onClick={() => setIsEditMode(!isEditMode)} 
            className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 flex items-center"
          >
            {isEditMode ? <FaSave className="mr-2" /> : <FaEdit className="mr-2" />}
            {isEditMode ? "Save Changes" : "Edit Profile"}
          </button>
        </div>
        
        {message && <p className="text-green-600 mb-4">{message}</p>}
        
        {isEditMode ? (
            <form onSubmit={handleUpdate}>
                {/* Simplified Edit Form: Only allows editing non-sensitive fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label>
                        Full Name:
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full border p-2 rounded-md" />
                    </label>
                    <label>
                        Phone:
                        <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full border p-2 rounded-md" />
                    </label>
                    {/* Add more editable fields here */}
                </div>
                <button type="submit" className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md">Save</button>
            </form>
        ) : (
            renderDetails()
        )}
        
        <div className="mt-8 border-t pt-4">
            <h4 className="text-lg font-semibold mb-3 flex items-center"><FaLock className="mr-2" /> Security</h4>
            <button className="text-sm text-red-500 hover:text-red-700">Change Password (Future Feature)</button>
        </div>
        <div className="mt-8 border-t pt-4 flex justify-between items-center">
            <h4 className="text-lg font-semibold mb-3 flex items-center"> Security</h4>
            <button 
                onClick={handleLogout} 
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center"
            >
                Log Out
            </button>
        </div>
      </div>
    </div>
  );
}