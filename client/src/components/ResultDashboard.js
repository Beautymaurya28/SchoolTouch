import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ResultDashboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // The backend logic (getStudentResults) handles filtering by role (Student/Parent)
        // and retrieves the correct student's published results.
        const res = await axios.get(`${API_BASE}/results/my-results`, { headers });
        setResults(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch results.');
        setLoading(false);
      }
    };
    fetchResults();
  }, [token]); 

  if (loading) return <p>Loading results...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (results.length === 0) return <p>No results have been published yet.</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Exam Results</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Exam Name</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Marks</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Grade</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Remark</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result) => (
              <tr key={result._id}>
                <td className="px-6 py-4 whitespace-nowrap">{result.exam.examName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{result.subject.subjectName}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">{result.marks}</td>
                <td className="px-6 py-4 whitespace-nowrap">{result.grade}</td>
                <td className="px-6 py-4 whitespace-nowrap">{result.status}</td>
                <td className="px-6 py-4 whitespace-nowrap">{result.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}