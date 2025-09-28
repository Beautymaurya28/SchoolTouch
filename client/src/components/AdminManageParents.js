import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

export default function AdminManageParents() {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', phone: '', address: '', studentIds: [] 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [parentsRes, studentsRes] = await Promise.all([
        axios.get(`${API_BASE}/parents`, { headers }),
        axios.get(`${API_BASE}/students`, { headers }),
      ]);
      setParents(parentsRes.data);
      setStudents(studentsRes.data);
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
          const res = await axios.get(`${API_BASE}/parents?search=${searchQuery}`, { headers });
          setParents(res.data);
      } catch (err) {
          setError('Failed to perform search.');
      }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMultiSelect = (e) => {
    const { options } = e.target;
    const selectedValues = Array.from(options).filter(opt => opt.selected).map(opt => opt.value);
    setFormData({ ...formData, studentIds: selectedValues });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (isEditing) {
        await axios.put(`${API_BASE}/parents/${editId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_BASE}/parents`, formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setFormData({ name: '', email: '', password: '', phone: '', address: '', studentIds: [] });
      setIsEditing(false);
      setEditId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleEdit = (parent) => {
    setFormData({ 
      name: parent.name, 
      email: parent.email, 
      phone: parent.phone, 
      address: parent.address, 
      studentIds: parent.children.map(c => c._id),
      password: ''
    });
    setIsEditing(true);
    setEditId(parent._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this parent account?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`${API_BASE}/parents/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  if (loading) return <p>Loading parents...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Parents</h2>
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex space-x-4">
          <input type="text" placeholder="Search by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="rounded-md w-full" />
          <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded-md"><FaSearch /></button>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 rounded-md" required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full mt-1 rounded-md" required />
        </div>
        <div>
          <label>Phone Number</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full mt-1 rounded-md" required />
        </div>
        {!isEditing && (
          <div>
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full mt-1 rounded-md" required />
          </div>
        )}
        <div className="md:col-span-2">
          <label>Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full mt-1 rounded-md" />
        </div>
        <div className="md:col-span-2">
          <label>Link to Student(s)</label>
          <select multiple name="studentIds" value={formData.studentIds} onChange={handleMultiSelect} className="w-full mt-1 rounded-md h-24">
            {students.map(student => <option key={student._id} value={student._id}>{student.name} ({student.rollNumber})</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">
            {isEditing ? 'Update Parent' : 'Add New Parent'}
          </button>
        </div>
      </form>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked Children</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parents.map(parent => (
              <tr key={parent._id}>
                <td className="px-6 py-4 whitespace-nowrap">{parent.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{parent.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{parent.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {parent.children.map(child => <span key={child._id}>{child.name} </span>)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(parent)} className="text-indigo-600 hover:text-indigo-900 mr-2"><FaEdit /></button>
                  <button onClick={() => handleDelete(parent._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}