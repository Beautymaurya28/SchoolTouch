import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', studentCode: '', rollNumber: '', classId: '', section: '',
    phone: '', address: '', gender: '', age: '', dob: '', parentPhone: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [studentsRes, classesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/students`, { headers }),
        axios.get(`${API_BASE_URL}/classes`, { headers }),
      ]);
      setStudents(studentsRes.data);
      setClasses(classesRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data.');
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.get(`${API_BASE_URL}/students?search=${searchQuery}&class=${filterClass}`, { headers });
      setStudents(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to perform search.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/students/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/students`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setFormData({
        name: '', email: '', password: '', studentCode: '', rollNumber: '', classId: '', section: '',
        phone: '', address: '', gender: '', age: '', dob: '', parentPhone: ''
      });
      setIsEditing(false);
      setEditId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      email: student.user?.email || '',
      studentCode: student.studentCode,
      rollNumber: student.rollNumber,
      classId: student.class?._id || '',
      section: student.section,
      phone: student.phone,
      address: student.address,
      gender: student.gender,
      age: student.age,
      dob: student.dob?.split('T')[0] || '',
      parentPhone: student.parent?.phone || '',
      password: ''
    });
    setIsEditing(true);
    setEditId(student._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`${API_BASE_URL}/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  if (loading) return <p>Loading students...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Students</h2>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex space-x-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-md w-full"
        />
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="rounded-md">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.className} {c.section}</option>)}
        </select>
        <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded-md"><FaSearch /></button>
      </div>

      {/* Student Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 rounded-md" required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full mt-1 rounded-md" required />
        </div>
        {!isEditing && (
          <div>
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full mt-1 rounded-md" required />
          </div>
        )}
        <div>
          <label>Student Code</label>
          <input type="text" name="studentCode" value={formData.studentCode} onChange={handleChange} className="w-full mt-1 rounded-md" required />
        </div>
        <div>
          <label>Roll Number</label>
          <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} className="w-full mt-1 rounded-md" />
        </div>
        <div>
          <label>Class</label>
          <select name="classId" value={formData.classId} onChange={handleChange} className="w-full mt-1 rounded-md" required>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.className} {c.section}</option>)}
          </select>
        </div>
        <div>
          <label>Section</label>
          <input type="text" name="section" value={formData.section} onChange={handleChange} className="w-full mt-1 rounded-md" />
        </div>
        <div>
          <label>Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full mt-1 rounded-md" />
        </div>
        <div>
          <label>Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full mt-1 rounded-md" />
        </div>
        <div>
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className="w-full mt-1 rounded-md">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label>Age</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full mt-1 rounded-md" />
        </div>
        <div>
          <label>Date of Birth</label>
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full mt-1 rounded-md" />
        </div>
        <div className="lg:col-span-3">
          <label>Parent Phone (to link/create parent)</label>
          <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleChange} className="w-full mt-1 rounded-md" required />
        </div>
        <div className="lg:col-span-3">
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">
            {isEditing ? 'Update Student' : 'Add New Student'}
          </button>
        </div>
      </form>

      {/* Students Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student._id}>
                <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.user?.email || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.studentCode}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.rollNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.class?.className || 'N/A'} / {student.section || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.parent?.phone || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(student)} className="text-indigo-600 hover:text-indigo-900 mr-2"><FaEdit /></button>
                  <button onClick={() => handleDelete(student._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}