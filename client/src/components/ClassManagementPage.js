import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';

export default function ClassManagementPage() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // Store all students
  const [filteredStudents, setFilteredStudents] = useState([]); // Students shown in the select box
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ className: '', section: '', classTeacherId: '', subjects: [], studentIds: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [studentSearch, setStudentSearch] = useState(''); // New state for student search

  const API_BASE_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  // Effect to filter students when the search bar changes
  useEffect(() => {
    const term = studentSearch.toLowerCase();
    if (term === '') {
      setFilteredStudents(allStudents);
    } else {
      const results = allStudents.filter(student =>
        student.name.toLowerCase().includes(term) || student.rollNumber.toString().includes(term)
      );
      setFilteredStudents(results);
    }
  }, [studentSearch, allStudents]);


  const fetchData = async () => {
    try {
      const [classesRes, teachersRes, studentsRes, subjectsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/classes`, { headers }),
        axios.get(`${API_BASE_URL}/teachers`, { headers }),
        axios.get(`${API_BASE_URL}/students`, { headers }),
        axios.get(`${API_BASE_URL}/subjects`, { headers }),
      ]);
      setClasses(classesRes.data);
      setTeachers(teachersRes.data);
      setAllStudents(studentsRes.data); // Store all students
      setFilteredStudents(studentsRes.data); // Initialize filtered list
      setSubjects(subjectsRes.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleMultiSelect = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options).filter(opt => opt.selected).map(opt => opt.value);
    
    // FIX: Ensure selected students stay selected even if they are filtered out
    const currentSelectedIds = new Set(formData.studentIds);
    const newSelectedIds = new Set(selectedValues);
    
    // Merge existing selected students with newly selected ones
    const finalSelection = Array.from(newSelectedIds);
    
    setFormData({ ...formData, [name]: finalSelection });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/classes/${editId}`, formData, { headers });
      } else {
        await axios.post(`${API_BASE_URL}/classes`, formData, { headers });
      }
      setFormData({ className: '', section: '', classTeacherId: '', subjects: [], studentIds: [] });
      setIsEditing(false);
      setEditId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleEdit = (classItem) => {
    setFormData({
      className: classItem.className,
      section: classItem.section,
      classTeacherId: classItem.classTeacher?._id || '',
      subjects: classItem.subjects?.map(s => s._id) || [],
      studentIds: classItem.students?.map(s => s._id) || []
    });
    setIsEditing(true);
    setEditId(classItem._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await axios.delete(`${API_BASE_URL}/classes/${id}`, { headers });
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed.');
      }
    }
  };
  
  if (loading) return <p>Loading classes...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Class Management</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Class Name</label>
          <input type="text" name="className" value={formData.className} onChange={handleChange} className="w-full mt-1 rounded-md" required />
        </div>
        <div>
          <label>Section</label>
          <input type="text" name="section" value={formData.section} onChange={handleChange} className="w-full mt-1 rounded-md" />
        </div>
        <div>
          <label>Class Teacher</label>
          <select name="classTeacherId" value={formData.classTeacherId} onChange={handleChange} className="w-full mt-1 rounded-md">
            <option value="">-- Assign a Teacher --</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label>Subjects</label>
          <select multiple name="subjects" value={formData.subjects} onChange={handleMultiSelect} className="w-full mt-1 rounded-md h-24">
            {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
          </select>
        </div>
        {/* Student Select Box with Search Filter */}
        <div className="md:col-span-2">
          <label>Students</label>
          <div className="flex items-center mb-1">
            <input 
              type="text" 
              placeholder="Search student by name or roll..." 
              value={studentSearch} 
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full rounded-l-md"
            />
            <button type="button" className="bg-gray-200 p-2 rounded-r-md">
                <FaSearch />
            </button>
          </div>
          <select multiple name="studentIds" value={formData.studentIds} onChange={handleMultiSelect} className="w-full mt-1 rounded-md h-40">
            {filteredStudents.map(s => (
              <option 
                key={s._id} 
                value={s._id}
                // Highlight students already selected even if filtered out
                style={{ backgroundColor: formData.studentIds.includes(s._id) ? '#ffd2bd' : 'white' }}
              >
                {s.name} (Roll: {s.rollNumber || 'N/A'})
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">
            {isEditing ? 'Update Class' : 'Add New Class'}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes.map((classItem) => (
              <tr key={classItem._id}>
                <td className="px-6 py-4 whitespace-nowrap">{classItem.className}</td>
                <td className="px-6 py-4 whitespace-nowrap">{classItem.section}</td>
                <td className="px-6 py-4 whitespace-nowrap">{classItem.classTeacher?.name || 'Not assigned'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{classItem.subjects?.map(s => s.subjectName).join(', ')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{classItem.students?.length}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(classItem)} className="text-indigo-600 hover:text-indigo-900 mr-2"><FaEdit /></button>
                  <button onClick={() => handleDelete(classItem._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}