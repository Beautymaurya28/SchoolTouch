import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentExamDashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchExamTimetable = async () => {
      const token = localStorage.getItem('token');
      const studentProfileId = localStorage.getItem('profileId');
      const headers = { Authorization: `Bearer ${token}` };

      if (!studentProfileId || !token) {
        setError('User not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/exams/timetable/student/${studentProfileId}`, { headers });
        setExams(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch exam timetable.');
      } finally {
        setLoading(false);
      }
    };
    fetchExamTimetable();
  }, []);

  if (loading) return <p>Loading exams...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (exams.length === 0) return <p>No exams have been scheduled yet.</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Exams</h2>
      {exams.map(exam => (
        <div key={exam._id} className="bg-white p-6 rounded-lg shadow-md mb-4">
          <h3 className="text-xl font-bold mb-2">{exam.examName} ({exam.examType})</h3>

          <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invigilator</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exam.subjects.map((subject, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{subject.subjectId?.subjectName || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {subject.date ? new Date(subject.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{subject.startTime} - {subject.endTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{subject.room || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{subject.invigilator?.name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
