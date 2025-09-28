import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSave } from 'react-icons/fa';

export default function ResultSubmission() {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]); // Needed for Invigilator selection on UT creation
  
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [marks, setMarks] = useState({}); // Stores marks input: {studentId: mark}
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // State for creating a Unit Test
  const [unitTestFormData, setUnitTestFormData] = useState({
      examName: '', classId: '', subjectId: '', maxMarks: 100, passingMarks: 33, date: '', startTime: '09:00', endTime: '10:00', room: '', invigilatorId: ''
  });

  const API_BASE_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const teacherProfileId = localStorage.getItem('profileId');

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
      setSubjects(subjectsRes.data);
      setTeachers(teachersRes.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load initial data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); 
  }, []);

  useEffect(() => {
      // Fetches students for the currently selected exam's class
      const fetchStudentsForExam = async () => {
        if (!selectedExam) {
            setStudents([]); 
            return;
        }
        const exam = exams.find(e => e._id === selectedExam);
        if (!exam || !exam.class) return;
        
        try {
          // Fetch students for the class linked to the selected exam
          const studentsRes = await axios.get(`${API_BASE_URL}/students?classId=${exam.class._id}`, { headers });
          setStudents(studentsRes.data);
        } catch (err) {
          setError('Failed to load students for this class.');
        }
      };
      fetchStudentsForExam();
  }, [selectedExam, exams]);
  
  const handleMarkChange = (studentId, value) => {
      // Ensure mark is treated as a number
      setMarks(prev => ({ ...prev, [studentId]: value === '' ? '' : Math.max(0, parseInt(value, 10) || 0) }));
  };

  // --- SUBMIT MARKS LOGIC ---
  const handleSubmitMarks = async (e) => {
      e.preventDefault();
      if (!selectedExam || !selectedSubject) {
          return setMessage('Please select both an Exam and a Subject.');
      }

      // Check the max marks for the selected subject
      const selectedExamDetails = exams.find(e => e._id === selectedExam);
      const subjectDetails = selectedExamDetails?.subjects?.find(s => s.subjectId._id === selectedSubject);
      const maxMarks = subjectDetails?.maxMarks || 0;

      const results = students.map(student => ({
          studentId: student._id,
          // Cap the marks at maxMarks
          marks: Math.min(parseInt(marks[student._id] || 0, 10), maxMarks),
      }));

      try {
          await axios.post(`${API_BASE_URL}/results`, {
              examId: selectedExam,
              subjectId: selectedSubject,
              results
          }, { headers });
          setMessage('Marks submitted successfully! ✅');
          // Optional: Clear marks state or re-fetch to show new status
      } catch (err) {
          setError(err.response?.data?.message || 'Failed to submit results.');
          setMessage('');
      }
  };

  // --- CREATE UNIT TEST LOGIC ---
  const handleUnitTestChange = (e) => {
      const { name, value } = e.target;
      setUnitTestFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCreateUnitTest = async (e) => {
      e.preventDefault();
      
      // 1. Structure the subjects array to match the Exam model
      const subjectsPayload = [{ 
          subjectId: unitTestFormData.subjectId, 
          maxMarks: parseInt(unitTestFormData.maxMarks, 10), 
          passingMarks: parseInt(unitTestFormData.passingMarks, 10), 
          date: unitTestFormData.date, 
          startTime: unitTestFormData.startTime, 
          endTime: unitTestFormData.endTime, 
          room: unitTestFormData.room,
          invigilator: unitTestFormData.invigilatorId || teacherProfileId // Teacher is the default invigilator
      }];
      
      const examData = { 
          examName: unitTestFormData.examName,
          examType: 'Unit Test', 
          classId: unitTestFormData.classId, 
          subjects: subjectsPayload, 
          resultFormat: 'marks' 
      };

      try {
          await axios.post(`${API_BASE_URL}/exams`, examData, { headers });
          setMessage('Unit Test created successfully! ✅');
          setShowCreateForm(false);
          setUnitTestFormData({ examName: '', classId: '', subjectId: '', maxMarks: 100, passingMarks: 33, date: '', startTime: '09:00', endTime: '10:00', room: '', invigilatorId: '' });
          fetchData(); // Refresh exams list
      } catch (err) {
          setError(err.response?.data?.message || 'Failed to create unit test.');
          setMessage('');
      }
  };
  
  if (loading) return <p>Loading data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const selectedExamDetails = exams.find(e => e._id === selectedExam);
  const maxMarks = selectedExamDetails?.subjects?.find(s => s.subjectId._id === selectedSubject)?.maxMarks || 0;

  return (
    <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Exam and Result Submission</h2>
        
        {/* --- UNIT TEST CREATION FORM --- */}
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-orange-600 text-white px-4 py-2 rounded-md mb-4">
            {showCreateForm ? 'Hide Unit Test Form' : 'Create New Unit Test'}
        </button>

        {showCreateForm && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-bold mb-4">Create Unit Test</h3>
                <form onSubmit={handleCreateUnitTest} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Test Details */}
                    <div className="md:col-span-3">
                        <label>Test Name</label>
                        <input type="text" name="examName" value={unitTestFormData.examName} onChange={handleUnitTestChange} className="w-full mt-1 rounded-md" required />
                    </div>
                    {/* Class/Subject Selection */}
                    <div>
                        <label>Class</label>
                        <select name="classId" value={unitTestFormData.classId} onChange={handleUnitTestChange} className="w-full mt-1 rounded-md" required>
                            <option value="">-- Select Class --</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.className} {c.section}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Subject</label>
                        <select name="subjectId" value={unitTestFormData.subjectId} onChange={handleUnitTestChange} className="w-full mt-1 rounded-md" required>
                            <option value="">-- Select Subject --</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
                        </select>
                    </div>
                    {/* Marks & Date */}
                    <div>
                        <label>Max Marks</label>
                        <input type="number" name="maxMarks" value={unitTestFormData.maxMarks} onChange={handleUnitTestChange} className="w-full mt-1 rounded-md" required />
                    </div>
                    <div>
                        <label>Passing Marks</label>
                        <input type="number" name="passingMarks" value={unitTestFormData.passingMarks} onChange={handleUnitTestChange} className="w-full mt-1 rounded-md" required />
                    </div>
                    <div>
                        <label>Date</label>
                        <input type="date" name="date" value={unitTestFormData.date} onChange={handleUnitTestChange} className="w-full mt-1 rounded-md" required />
                    </div>
                    {/* Submit */}
                    <div className="md:col-span-3">
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">Create Unit Test & Schedule</button>
                    </div>
                </form>
            </div>
        )}

        {/* --- MARKS SUBMISSION FORM (Teacher enters marks here) --- */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-bold mb-4">Enter Marks for Existing Exams</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label>Select Exam</label>
                    <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className="w-full mt-1 rounded-md">
                        <option value="">-- Select Exam --</option>
                        {exams.map(exam => <option key={exam._id} value={exam._id}>{exam.examName} ({exam.class?.className} {exam.class?.section})</option>)}
                    </select>
                </div>
                <div>
                    <label>Select Subject</label>
                    <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full mt-1 rounded-md">
                        <option value="">-- Select Subject --</option>
                        {selectedExamDetails?.subjects?.map(s => <option key={s.subjectId._id} value={s.subjectId._id}>{s.subjectId.subjectName}</option>)}
                    </select>
                </div>
            </div>
            {students.length > 0 && selectedSubject && (
                <div className="mt-6">
                    <h3 className="text-lg font-bold mb-4">Enter Marks (Max: {maxMarks})</h3>
                    <form onSubmit={handleSubmitMarks}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Student Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Roll No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Marks Scored</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{student.rollNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input 
                                                    type="number" 
                                                    max={maxMarks} 
                                                    min="0"
                                                    value={marks[student._id] || ''} 
                                                    onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                                    className="w-20 border rounded-md p-1"
                                                    required
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
                            <FaSave className="inline-block mr-2" /> Submit Marks
                        </button>
                    </form>
                </div>
            )}
            {message && <p className="mt-4 text-green-500">{message}</p>}
            {error && <p className="mt-4 text-red-500">{error}</p>}
        </div>
    </div>
  );
}