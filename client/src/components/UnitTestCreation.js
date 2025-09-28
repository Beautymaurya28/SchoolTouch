import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UnitTestCreation() {
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [marks, setMarks] = useState({});
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [unitTestFormData, setUnitTestFormData] = useState({
        examName: '', classId: '', subjectId: '', maxMarks: '', passingMarks: '', date: '', startTime: '', endTime: '', room: '', invigilatorId: ''
    });

    const API_BASE_URL = 'http://localhost:5000/api';
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        const [examsRes, classesRes, subjectsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/exams`, { headers }),
          axios.get(`${API_BASE_URL}/classes`, { headers }),
          axios.get(`${API_BASE_URL}/subjects`, { headers }),
        ]);
        setExams(examsRes.data);
        setClasses(classesRes.data);
        setSubjects(subjectsRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data.');
        setLoading(false);
      }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const handleUnitTestChange = (e) => {
        const { name, value } = e.target;
        setUnitTestFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCreateUnitTest = async (e) => {
        e.preventDefault();
        const examData = { ...unitTestFormData, examType: 'Unit Test', subjects: [{ subjectId: unitTestFormData.subjectId, maxMarks: unitTestFormData.maxMarks, passingMarks: unitTestFormData.passingMarks, date: unitTestFormData.date, startTime: unitTestFormData.startTime, endTime: unitTestFormData.endTime, room: unitTestFormData.room, invigilatorId: unitTestFormData.invigilatorId }] };
        try {
            await axios.post(`${API_BASE_URL}/exams`, examData, { headers });
            setMessage('Unit Test created successfully! ✅');
            setShowCreateForm(false);
            setUnitTestFormData({ examName: '', classId: '', subjectId: '', maxMarks: '', passingMarks: '', date: '', startTime: '', endTime: '', room: '', invigilatorId: '' });
            fetchData(); // Refresh exams list
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to create unit test.');
        }
    };
    
    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Create Unit Test</h2>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <form onSubmit={handleCreateUnitTest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label>Test Name</label>
                        <input type="text" name="examName" value={unitTestFormData.examName} onChange={handleUnitTestChange} className="w-full mt-1 rounded-md" required />
                    </div>
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
                    <div className="md:col-span-2">
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">Create Unit Test</button>
                    </div>
                </form>
            </div>
        </div>
      );
    }