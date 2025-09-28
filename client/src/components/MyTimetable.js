import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MyTimetable() {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const profileId = localStorage.getItem('profileId');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!profileId || !token) {
        setError('User not found. Please log in again.');
        setLoading(false);
        return;
      }
      try {
        let res;
        if (role === 'student' || role === 'parent') {
          const studentRes = await axios.get(`${API_BASE_URL}/students/${profileId}`, { headers });
          const classId = studentRes.data.class._id;
          res = await axios.get(`${API_BASE_URL}/timetables/class/${classId}`, { headers });
        } else if (role === 'teacher') {
          const teacherRes = await axios.get(`${API_BASE_URL}/teachers/${profileId}`, { headers });
          const assignedClassId = teacherRes.data.assignedClass;
          if (assignedClassId) {
             res = await axios.get(`${API_BASE_URL}/timetables/class/${assignedClassId._id}`, { headers });
          } else {
             res = await axios.get(`${API_BASE_URL}/timetables/teacher/${profileId}`, { headers });
          }
        }
        setTimetable(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch timetable.');
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [profileId, token, role]);

  if (loading) return <p>Loading timetable...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!timetable || !timetable.schedule || timetable.schedule.length === 0) {
    return <p>No timetable found.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Timetable for {timetable.class.className} {timetable.class.section}</h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timetable.schedule.map(day => 
              day.periods.map(period => (
                <tr key={`${day.day}-${period.periodNumber}`}>
                  <td className="px-6 py-4 whitespace-nowrap">{day.day}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{period.periodNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{period.startTime} - {period.endTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{period.subject.subjectName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{period.teacher.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}