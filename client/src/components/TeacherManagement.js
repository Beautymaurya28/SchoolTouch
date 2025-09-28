import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';


export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', age: '', dob: '', gender: '',
    qualification: '', isClassTeacher: false, assignedClass: '', assignedSubjects: [], address: '', bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [newSubject, setNewSubject] = useState({ classId: '', subjectId: '' });

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [teachersRes, classesRes, subjectsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/teachers`, { headers }),
        axios.get(`${API_BASE_URL}/classes`, { headers }),
        axios.get(`${API_BASE_URL}/subjects`, { headers }),
      ]);
      setTeachers(teachersRes.data);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
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
      const res = await axios.get(`${API_BASE_URL}/teachers?search=${searchQuery}&class=${filterClass}`, { headers });
      setTeachers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to perform search.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', password: '', phone: '', age: '', dob: '', gender: '',
      qualification: '', isClassTeacher: false, assignedClass: '', assignedSubjects: [], address: '', bio: ''
    });
    setIsEditing(false);
    setEditId(null);
    setNewSubject({ classId: '', subjectId: '' });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubjectChange = (e) => {
    setNewSubject({ ...newSubject, [e.target.name]: e.target.value });
  };

  const addAssignedSubject = () => {
    if (newSubject.classId && newSubject.subjectId) {
      setFormData(prev => ({
        ...prev,
        assignedSubjects: [...prev.assignedSubjects, { class: newSubject.classId, subject: newSubject.subjectId }]
      }));
      setNewSubject({ classId: '', subjectId: '' });
    }
  };

  const removeAssignedSubject = (index) => {
    setFormData(prev => {
      const newSubjects = [...prev.assignedSubjects];
      newSubjects.splice(index, 1);
      return { ...prev, assignedSubjects: newSubjects };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/teachers/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/teachers`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleEdit = (teacher) => {
  setFormData({
    name: teacher.name || '',
    email: teacher.user?.email || '',
    phone: teacher.phone || '',
    age: teacher.age || '',
    dob: teacher.dob?.split('T')[0] || '',
    gender: teacher.gender || '',
    qualification: teacher.qualification || '',
    isClassTeacher: teacher.isClassTeacher || false,
    assignedClass: teacher.assignedClass?._id || '',
    // FIX: Map the complex subject object to a simple object with IDs
    assignedSubjects: teacher.assignedSubjects?.map(s => ({
      class: s.class?._id,
      // The backend populates this as s.subject._id
      subject: s.subject?._id
    })) || [],
    address: teacher.address || '',
    bio: teacher.bio || '',
    password: ''
  });
  setIsEditing(true);
  setEditId(teacher._id);
};

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`${API_BASE_URL}/teachers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  if (loading) return <p>Loading teachers...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Teachers</h2>
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

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{isEditing ? 'Edit Teacher' : 'Add New Teacher'}</h3>
          {isEditing && (
            <button onClick={resetForm} className="text-gray-500 hover:text-red-500"><FaTimes /></button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label>Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full mt-1 rounded-md" />
          </div>
          <div>
            <label>Age</label>
            <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full mt-1 rounded-md" />
          </div>
          <div>
            <label>Date of Birth</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full mt-1 rounded-md" />
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
            <label>Qualification</label>
            <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} className="w-full mt-1 rounded-md" />
          </div>
          <div className="md:col-span-2">
            <label>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full mt-1 rounded-md" />
          </div>
          <div className="md:col-span-2">
            <label>Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full mt-1 rounded-md"></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isClassTeacher"
                checked={formData.isClassTeacher}
                onChange={handleChange}
                className="rounded text-blue-600"
              />
              <span className="ml-2">Is Class Teacher?</span>
            </label>
            {formData.isClassTeacher && (
              <select name="assignedClass" value={formData.assignedClass} onChange={handleChange} className="w-full mt-2 rounded-md">
                <option value="">-- Assign a Class --</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.className} {c.section}</option>)}
              </select>
            )}
          </div>
          <div className="md:col-span-2">
            <h4 className="font-semibold mt-4">Assigned Subjects</h4>
            <div className="flex space-x-2 mt-2">
              <select name="classId" value={newSubject.classId} onChange={handleSubjectChange} className="w-1/2 rounded-md">
                <option value="">Select Class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.className} {c.section}</option>)}
              </select>
              <select name="subjectId" value={newSubject.subjectId} onChange={handleSubjectChange} className="w-1/2 rounded-md">
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
              </select>
              <button type="button" onClick={addAssignedSubject} className="bg-green-500 text-white px-4 py-2 rounded-md">Add</button>
            </div>
            <ul className="mt-2 list-disc ml-4">
              {formData.assignedSubjects?.map((s, index) => (
                <li key={index} className="flex justify-between items-center my-1">
                  <span>{classes.find(c => c._id === s.class)?.className} {classes.find(c => c._id === s.class)?.section} - {subjects.find(sub => sub._id === s.subject)?.subjectName}</span>
                  <button type="button" onClick={() => removeAssignedSubject(index)} className="text-red-500"><FaTimes /></button>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">
              {isEditing ? 'Update Teacher' : 'Add New Teacher'}
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Subjects</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
         <tbody className="bg-white divide-y divide-gray-200">
  {teachers.map((teacher) => (
    <tr key={teacher._id}>
      <td className="px-6 py-4 whitespace-nowrap">{teacher.name}</td>
      <td className="px-6 py-4 whitespace-nowrap">{teacher.user?.email}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        {teacher.isClassTeacher ? `${teacher.assignedClass?.className} ${teacher.assignedClass?.section}` : 'No'}
      </td>
      {/* FIX: Use optional chaining to prevent crash */}
      <td className="px-6 py-4 whitespace-nowrap">
  {teacher.assignedSubjects?.map((s, idx) => (
    <span key={idx}>
      {s.class?.className} {s.class?.section} - {s.subject?.subjectName}
    </span>
  ))}
</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button onClick={() => handleEdit(teacher)} className="text-indigo-600 hover:text-indigo-900 mr-2"><FaEdit /></button>
        <button onClick={() => handleDelete(teacher._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
    </div>
  );
}