import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PublishResults() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchExams = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/exams`, { headers });
      setExams(res.data);
      setLoading(false);
    } catch (err) {
      setMessage('Failed to fetch exams.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handlePublish = async () => {
    if (!selectedExamId) {
      return setMessage('Please select an exam to publish results for.');
    }
    try {
      await axios.patch(`${API_BASE_URL}/exams/results/publish/${selectedExamId}`, {}, { headers });
      setMessage('Results published successfully! ✅');
      fetchExams();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to publish results.');
    }
  };

  if (loading) return <p>Loading exams...</p>;
  if (exams.length === 0) return <p>No exams found to publish results for.</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Publish Results</h2>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <label className="block text-gray-700">Select Exam</label>
        <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)} className="w-full mt-1 rounded-md" required>
          <option value="">-- Select Exam --</option>
          {exams.map(exam => <option key={exam._id} value={exam._id}>{exam.examName} ({exam.class.className} {exam.class.section})</option>)}
        </select>
        <button onClick={handlePublish} className="w-full bg-blue-600 text-white py-2 rounded-md mt-4">
          Publish Results
        </button>
        {message && <p className="mt-4 text-green-500">{message}</p>}
      </div>
    </div>
  );
}