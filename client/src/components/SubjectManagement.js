import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [classId, setClassId] = useState('');
  const [message, setMessage] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  const fetchClasses = async () => {
      try {
          const res = await axios.get(`${API_BASE_URL}/classes`, { headers });
          setClasses(res.data);
      } catch (err) {
          setError('Failed to fetch classes.');
      }
  };

  const fetchSubjects = async () => {
      try {
          const res = await axios.get(`${API_BASE_URL}/subjects`, { headers });
          setSubjects(res.data);
          setLoading(false);
      } catch (err) {
          setError('Failed to fetch subjects.');
          setLoading(false);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/subjects`, { subjectName, classId }, { headers });
      setMessage('Subject added successfully!');
      setSubjectName('');
      setClassId('');
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await axios.delete(`${API_BASE_URL}/subjects/${id}`, { headers });
        fetchSubjects();
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  if (loading) return <p>Loading subjects...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Subjects</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-bold mb-4">Add New Subject</h3>
        <div className="flex space-x-2">
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-1/3 rounded-md" required>
              <option value="">-- Select Class --</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.className} {c.section}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="Enter subject name (e.g., Science)" 
            value={subjectName} 
            onChange={(e) => setSubjectName(e.target.value)} 
            className="w-full mt-1 rounded-md" 
            required 
          />
          <button type="submit" className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md">Add</button>
        </div>
        {message && <p className="mt-4 text-green-500">{message}</p>}
      </form>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-bold p-4">Existing Subjects</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
  {subjects.map((subject) => (
    <tr key={subject._id}>
      <td className="px-6 py-4 whitespace-nowrap">{subject.subjectName}</td>
      {/* FIX: Use optional chaining to prevent crash */}
      <td className="px-6 py-4 whitespace-nowrap">{subject.class?.className} {subject.class?.section}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button onClick={() => handleDelete(subject._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
    </div>
  );
}