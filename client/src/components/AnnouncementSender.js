import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

export default function AnnouncementSender() {
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', targetClass: '', targetRole: 'all', attachment: null, date: '', time: ''
  });
  const [classes, setClasses] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const userRole = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  // Fetch classes (admin = all, teacher = only own)
  const fetchClasses = async () => {
    try {
      const url = userRole === 'admin'
        ? `${API_BASE_URL}/classes`
        : `${API_BASE_URL}/teachers/my-classes`;

      const res = await axios.get(url, { headers });
      const data = Array.isArray(res.data) ? res.data : [];
      setClasses(data);
    } catch (err) {
      console.error("Class fetch error:", err.response?.data || err.message);
      setError('Failed to fetch classes.');
    }
  };

  // Fetch announcements (admin = all, teacher = only own)
  const fetchAnnouncements = async () => {
    try {
      const url = userRole === 'admin'
        ? `${API_BASE_URL}/announcements/admin`
        : `${API_BASE_URL}/announcements`;

      const res = await axios.get(url, { headers });

      const filtered = userRole === 'admin'
        ? res.data
        : res.data.filter(ann => ann.createdBy?._id === userId);

      setAnnouncements(filtered);
    } catch (err) {
      console.error("Announcement fetch error:", err.response?.data || err.message);
      setError('Failed to fetch announcements.');
    }
  };

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'teacher') {
      fetchClasses();
      fetchAnnouncements();
    }
  }, [userRole, token, userId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', targetClass: '', targetRole: 'all', attachment: null, date: '', time: ''
    });
    setIsEditing(false);
    setEditId(null);
    setMessage('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('targetClass', formData.targetClass);
    data.append('targetRole', formData.targetRole);
    if (formData.attachment) data.append('attachment', formData.attachment);
    if (formData.date) data.append('date', formData.date);
    if (formData.time) data.append('time', formData.time);

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/announcements/${editId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
        });
        setMessage('Announcement updated successfully! ✅');
      } else {
        await axios.post(`${API_BASE_URL}/announcements`, data, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
        });
        setMessage('Announcement sent successfully! ✅');
      }
      resetForm();
      fetchAnnouncements();
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Action failed.');
      setMessage('');
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      description: announcement.description,
      targetClass: announcement.targetClass?._id || '',
      targetRole: announcement.targetRole,
      attachment: null,
      date: announcement.date ? new Date(announcement.date).toISOString().split('T')[0] : '',
      time: announcement.time || ''
    });
    setIsEditing(true);
    setEditId(announcement._id);
    setMessage('');
    setError(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await axios.delete(`${API_BASE_URL}/announcements/${id}`, { headers });
        setMessage('Announcement deleted successfully! ✅');
        fetchAnnouncements();
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed.');
        setMessage('');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Announcement' : 'Create New Announcement'}</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" required />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"></textarea>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Target Audience</label>
          <select name="targetRole" value={formData.targetRole} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" required>
            <option value="all">Entire School</option>
            <option value="teacher">All Teachers</option>
            <option value="student">All Students</option>
            <option value="parent">All Parents</option>
            {(userRole === 'admin' || userRole === 'teacher') && classes.length > 0 && (
              <option value="class">Specific Class</option>
            )}
          </select>
        </div>

        {formData.targetRole === 'class' && (
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Select Class</label>
            <select name="targetClass" value={formData.targetClass} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" required>
              <option value="">-- Select Class --</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.className} {c.section}</option>)}
            </select>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-gray-700 text-sm font-bold mb-2">Date (Optional)</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-700 text-sm font-bold mb-2">Time (Optional)</label>
          <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-700 text-sm font-bold mb-2">Attachment (Optional)</label>
          <input type="file" name="attachment" onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" />
        </div>

        <div className="md:col-span-2 flex justify-between items-center">
          <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            {isEditing ? <><FaEdit className="inline-block mr-2" /> Update Announcement</> : <><FaPlus className="inline-block mr-2" /> Send Announcement</>}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50">
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {message && <p className="mt-4 text-green-500">{message}</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {/* Announcements Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-8">
        <h3 className="text-xl font-bold p-4">Your Posted Announcements</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {announcements.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No announcements yet.
                </td>
              </tr>
            ) : (
              announcements.map(announcement => (
                <tr key={announcement._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{announcement.title}</td>
                  <td className="px-6 py-4 whitespace-normal max-w-xs">{announcement.description || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {announcement.targetRole === 'class'
                      ? `${announcement.targetClass?.className || 'N/A'} ${announcement.targetClass?.section || ''}`
                      : announcement.targetRole}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {announcement.date ? new Date(announcement.date).toLocaleDateString() : 'N/A'} {announcement.time || ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleEdit(announcement)} className="text-blue-600 hover:text-blue-900 mr-3">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(announcement._id)} className="text-red-600 hover:text-red-900">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
