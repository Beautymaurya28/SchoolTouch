import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

export default function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]); // All subjects from DB
  const [subjectsForSelectedClass, setSubjectsForSelectedClass] = useState([]); // Filtered by class
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({ examName: '', examType: 'Unit Test', classId: '', subjects: [], resultFormat: 'marks' });
  const [scheduleData, setScheduleData] = useState([]); // Holds the complex schedule for new exam
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, classesRes, subjectsRes, teachersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/exams`, { headers }),
        axios.get(`${API_BASE_URL}/classes`, { headers }),
        axios.get(`${API_BASE_URL}/subjects`, { headers }),
        axios.get(`${API_BASE_URL}/teachers`, { headers }),
      ]);
      setExams(examsRes.data);
      setClasses(classesRes.data);
      setAllSubjects(subjectsRes.data);
      setTeachers(teachersRes.data);
    } catch (err) {
      setMessage('Failed to fetch initial data.');
    }
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClassSelect = (e) => {
    const classId = e.target.value;
    setFormData(prev => ({ ...prev, classId }));
    
    // 1. Filter subjects only for the selected class
    const filteredSubjects = allSubjects.filter(subject => subject.class._id === classId);
    setSubjectsForSelectedClass(filteredSubjects);
    
    // 2. Initialize schedule data (the list of subjects to be scheduled)
    const initialSchedule = filteredSubjects.map(subject => ({
      subjectId: subject._id,
      subjectName: subject.subjectName, // Display name
      date: '',
      startTime: '09:00',
      endTime: '10:00',
      room: '',
      invigilator: ''
    }));
    setScheduleData(initialSchedule);
  };
  
  const handleScheduleChange = (index, name, value) => {
      const updatedSchedule = [...scheduleData];
      updatedSchedule[index][name] = value;
      setScheduleData(updatedSchedule);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Check if any subject is missing key schedule info
    const missingSchedule = scheduleData.find(s => !s.date || !s.room || !s.invigilator);
    if (missingSchedule) {
        return setMessage('Error: Please set Date, Room, and Invigilator for all subjects.');
    }

    // 2. Prepare the final subjects array for the Exam model (This is the unified schedule)
    const finalSubjectsPayload = scheduleData.map(s => ({
        subjectId: s.subjectId,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        room: s.room,
        invigilator: s.invigilator,
        maxMarks: 100, // Default for now
        passingMarks: 33 // Default for now
    }));

    const finalPayload = {
        ...formData,
        subjects: finalSubjectsPayload,
    };
    
    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/exams/${editId}`, finalPayload, { headers });
      } else {
        await axios.post(`${API_BASE_URL}/exams`, finalPayload, { headers });
      }
      setMessage('Exam created and scheduled successfully! ✅');
      setFormData({ examName: '', examType: 'Unit Test', classId: '', subjects: [], resultFormat: 'marks' });
      setScheduleData([]);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Check console for details.');
      setMessage('');
    }
  };
  
  const handleEdit = (exam) => {
      // 1. Filter subjects for the class
      const filteredSubjects = allSubjects.filter(subject => subject.class._id === exam.class?._id);
      setSubjectsForSelectedClass(filteredSubjects);
      
      // 2. Map existing schedule data into the form state
      const existingSchedule = exam.subjects.map(s => ({
          subjectId: s.subjectId?._id,
          subjectName: s.subjectId?.subjectName || filteredSubjects.find(fs => fs._id === s.subjectId?._id)?.subjectName || 'N/A',
          date: s.date.split('T')[0],
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room,
          invigilator: s.invigilator?._id || ''
      }));
      setScheduleData(existingSchedule);

      // 3. Set main form data
      setFormData({
          examName: exam.examName,
          examType: exam.examType,
          classId: exam.class?._id || '',
          subjects: exam.subjects?.map(s => s.subjectId?._id) || [], 
          resultFormat: exam.resultFormat,
      });
      setIsEditing(true);
      setEditId(exam._id);
      setMessage('');
      setError(null);
  };
  
  const handleDelete = async (id) => {
      if (window.confirm('Are you sure you want to delete this exam?')) {
          try {
              await axios.delete(`${API_BASE_URL}/exams/${id}`, { headers });
              fetchData();
          } catch (err) {
              setMessage(err.response?.data?.message || 'Delete failed.');
          }
      }
  };


  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Exam Management & Scheduling</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Exam Name</label>
          <input type="text" name="examName" value={formData.examName} onChange={handleGeneralChange} className="w-full mt-1 rounded-md" required />
        </div>
        <div>
          <label>Exam Type</label>
          <select name="examType" value={formData.examType} onChange={handleGeneralChange} className="w-full mt-1 rounded-md">
            <option value="Unit Test">Unit Test</option>
            <option value="Half Yearly">Half Yearly</option>
            <option value="Final">Final</option>
          </select>
        </div>
        <div>
          <label>Class</label>
          <select name="classId" value={formData.classId} onChange={handleClassSelect} className="w-full mt-1 rounded-md" required>
            <option value="">-- Select Class --</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.className} {c.section}</option>)}
          </select>
        </div>
        <div>
          <label>Result Format</label>
          <select name="resultFormat" value={formData.resultFormat} onChange={handleGeneralChange} className="w-full mt-1 rounded-md">
            <option value="marks">Marks</option>
            <option value="grade">Grades</option>
            <option value="skill">Skills</option>
          </select>
        </div>
        
        {/* SCHEDULE BUILDER SECTION - DYNAMIC */}
        {scheduleData.length > 0 && (
          <div className="md:col-span-2 mt-4">
              <h4 className="font-semibold text-lg mb-3 border-b pb-2">Set Subject Schedule & Invigilator</h4>
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="px-3 py-2 text-left text-xs">Subject</th>
                          <th className="px-3 py-2 text-left text-xs">Date</th>
                          <th className="px-3 py-2 text-left text-xs">Start Time</th>
                          <th className="px-3 py-2 text-left text-xs">End Time</th>
                          <th className="px-3 py-2 text-left text-xs">Room</th>
                          <th className="px-3 py-2 text-left text-xs">Invigilator</th>
                      </tr>
                  </thead>
                  <tbody>
                      {scheduleData.map((s, index) => (
                          <tr key={s.subjectId}>
                              <td className="px-3 py-2">{s.subjectName}</td>
                              <td className="px-3 py-2">
                                  <input type="date" value={s.date} onChange={(e) => handleScheduleChange(index, 'date', e.target.value)} className="w-full text-sm rounded-md" required />
                              </td>
                              <td className="px-3 py-2">
                                  <input type="time" value={s.startTime} onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)} className="w-full text-sm rounded-md" required />
                              </td>
                              <td className="px-3 py-2">
                                  <input type="time" value={s.endTime} onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)} className="w-full text-sm rounded-md" required />
                              </td>
                              <td className="px-3 py-2">
                                  <input type="text" value={s.room} onChange={(e) => handleScheduleChange(index, 'room', e.target.value)} className="w-full text-sm rounded-md" required />
                              </td>
                              <td className="px-3 py-2">
                                  <select value={s.invigilator} onChange={(e) => handleScheduleChange(index, 'invigilator', e.target.value)} className="w-full text-sm rounded-md" required>
                                      <option value="">Select Teacher</option>
                                      {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                  </select>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        )}
        
        <div className="md:col-span-2">
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">
            {isEditing ? 'Update Exam & Schedule' : 'Create Exam & Schedule'}
          </button>
        </div>
      </form>
      {message && <p className="mt-4 text-green-500">{message}</p>}

      <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-8">
          <h3 className="text-xl font-bold p-4">Existing Exams</h3>
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {exams.map(exam => (
                      <tr key={exam._id}>
                          <td className="px-6 py-4 whitespace-nowrap">{exam.examName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{exam.examType}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{exam.class?.className} {exam.class?.section}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{exam.subjects?.length || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{exam.status}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button onClick={() => handleEdit(exam)} className="text-indigo-600 hover:text-indigo-900 mr-2"><FaEdit /></button>
                              <button onClick={() => handleDelete(exam._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
}