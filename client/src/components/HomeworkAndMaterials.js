import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaDownload, FaEye, FaFileUpload, FaTimes } from 'react-icons/fa';

export default function HomeworkAndMaterials() {
  const [homeworks, setHomeworks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [currentTab, setCurrentTab] = useState('homework');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Consolidated form data state
  const [formData, setFormData] = useState({ title: '', description: '', classId: '', subjectId: '', dueDate: '', attachments: null });
  
  const API_BASE_URL = 'http://localhost:5000/api';
  const userRole = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, [currentTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch common data (classes and subjects are required for ALL roles)
      const [classesRes, subjectsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/classes`, { headers }),
        axios.get(`${API_BASE_URL}/subjects`, { headers }),
      ]);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);

      // 2. Fetch data from the TWO SEPARATE ENDPOINTS
      const [homeworkRes, materialsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/homework`, { headers }),      // Fetches Homework
        axios.get(`${API_BASE_URL}/materials`, { headers }),     // Fetches Study Material
      ]);
      
      setHomeworks(homeworkRes.data);
      setMaterials(materialsRes.data);

      setLoading(false);
    } catch (err) {
      // Ensure error state captures any fetch failure
      setError(err.response?.data?.message || 'Failed to fetch initial data.');
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
      const { name, value, files } = e.target;
      setFormData({ ...formData, [name]: files ? files[0] : value });
  };
  
  // TEACHER/ADMIN: Create/Upload Logic
  const handleSubmit = async (e) => {
      e.preventDefault();
      const data = new FormData();
      
      // Use the appropriate backend endpoint based on the current tab
      const endpoint = currentTab === 'homework' ? `${API_BASE_URL}/homework` : `${API_BASE_URL}/materials`;
      const fileFieldName = currentTab === 'homework' ? 'attachments' : 'attachments'; // Backend should accept 'attachments' for both

      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('classId', formData.classId);
      data.append('subjectId', formData.subjectId);
      if (currentTab === 'homework') data.append('dueDate', formData.dueDate);
      if (formData.attachments) data.append(fileFieldName, formData.attachments);

      try {
          await axios.post(endpoint, data, {
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
          });
          setMessage(`${currentTab} created successfully!`);
          setShowForm(false);
          setFormData({ title: '', description: '', classId: '', subjectId: '', dueDate: '', attachments: null });
          fetchData();
      } catch (err) {
          setError(err.response?.data?.message || 'Action failed.');
          setMessage(null);
      }
  };
  
  // STUDENT: Submission Logic
  const submitStudentHomework = async (homeworkId) => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          
          const data = new FormData();
          data.append('file', file); // Field name must match backend route 'upload.single('file')'

          try {
              await axios.post(`${API_BASE_URL}/homework/${homeworkId}/submit`, data, {
                  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
              });
              setMessage('Homework submitted successfully!');
              fetchData();
          } catch (err) {
              setError(err.response?.data?.message || 'Submission failed.');
              setMessage(null);
          }
      };
      fileInput.click();
  };
  
  // TEACHER/ADMIN: Action Buttons Rendering
  const renderTeacherActions = (item) => (
          <>
            <button className="text-indigo-600 hover:text-indigo-900 mr-2"><FaEdit /></button>
            <button className="text-red-600 hover:text-red-900"><FaTrash /></button>
            {currentTab === 'homework' && (
              // This should link to a SubmissionViewer component/route
              <button className="text-blue-600 hover:text-blue-900 ml-2"><FaEye /> Submissions</button> 
            )}
          </>
      );
      
      // STUDENT/PARENT: Action Buttons Rendering
      const renderStudentActions = (item) => (
        <>
          {currentTab === 'homework' && (
            <>
                {/* Download Teacher's Instructions/File */}
                {item.attachments.length > 0 && <a href={item.attachments[0]} download className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm mr-2"><FaDownload /> File</a>}
                {/* Student Submission Button */}
                {userRole === 'student' && <button onClick={() => submitStudentHomework(item._id)} className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"><FaFileUpload /> Submit</button>}
            </>
          )}
          
          {currentTab === 'studyMaterial' && (
            <a href={item.fileUrl} download className="bg-green-600 text-white px-3 py-1 rounded-md text-sm"><FaDownload /> Download</a>
          )}
        </>
      );
      
      if (loading) return <p>Loading...</p>;
      if (error) return <p className="text-red-500">{error}</p>;

      return (
        <div className="container mx-auto p-4">
          <h2 className="text-2xl font-bold mb-4">Homework & Study Materials</h2>
          
          <div className="flex space-x-4 mb-4">
            <button onClick={() => setCurrentTab('homework')} className={`py-2 px-4 rounded-md ${currentTab === 'homework' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Homework</button>
            <button onClick={() => setCurrentTab('studyMaterial')} className={`py-2 px-4 rounded-md ${currentTab === 'studyMaterial' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Study Material</button>
            {userRole === 'teacher' && <button onClick={() => setShowForm(!showForm)} className="bg-green-600 text-white px-4 py-2 rounded-md"><FaPlus /> Add New</button>}
          </div>
          
          {showForm && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h3 className="text-xl font-bold mb-4">Add New {currentTab === 'homework' ? 'Homework' : 'Study Material'}</h3>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Form fields */}
                      <div>
                          <label>Title</label>
                          <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full mt-1 rounded-md" required />
                      </div>
                      <div className="md:col-span-2">
                          <label>Description</label>
                          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full mt-1 rounded-md"></textarea>
                      </div>
                      <div>
                          <label>Class</label>
                          <select name="classId" value={formData.classId} onChange={handleChange} className="w-full mt-1 rounded-md" required>
                              <option value="">-- Select Class --</option>
                              {classes.map(c => <option key={c._id} value={c._id}>{c.className} {c.section}</option>)}
                          </select>
                      </div>
                      <div>
                          <label>Subject</label>
                          <select name="subjectId" value={formData.subjectId} onChange={handleChange} className="w-full mt-1 rounded-md" required>
                              <option value="">-- Select Subject --</option>
                              {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
                          </select>
                      </div>
                      {currentTab === 'homework' && (
                          <div>
                              <label>Due Date</label>
                              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full mt-1 rounded-md" required />
                          </div>
                      )}
                      <div>
                          <label>Attachments</label>
                          <input type="file" name="attachments" onChange={handleChange} className="w-full mt-1 rounded-md" />
                      </div>
                      <div className="md:col-span-2">
                          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">
                              <FaPlus /> Add
                          </button>
                      </div>
                  </form>
              </div>
          )}

          {message && <p className="mt-4 text-green-500">{message}</p>}
          
          {currentTab === 'homework' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Homework</h3>
              {homeworks.length === 0 ? <p>No homework found.</p> : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {homeworks.map(item => (
                          <tr key={item._id}>
                              <td className="px-6 py-4 whitespace-nowrap">{item.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{item.class?.className} {item.class?.section}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{item.subject?.subjectName}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{new Date(item.dueDate).toLocaleDateString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  {userRole === 'teacher' && renderTeacherActions(item)}
                                  {(userRole === 'student' || userRole === 'parent') && renderStudentActions(item)}
                              </td>
                          </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          
          {currentTab === 'studyMaterial' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Study Material</h3>
              {materials.length === 0 ? <p>No study materials found.</p> : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {materials.map(item => (
                          <tr key={item._id}>
                              <td className="px-6 py-4 whitespace-nowrap">{item.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{item.class?.className} {item.class?.section}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{item.subject?.subjectName}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{item.createdBy?.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  {userRole === 'teacher' && renderTeacherActions(item)}
                                  {(userRole === 'student' || userRole === 'parent') && renderStudentActions(item)}
                              </td>
                          </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      );
    }