// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// export default function AttendanceReport() {
//   const [attendance, setAttendance] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const API_BASE = 'http://localhost:5000/api';

//   useEffect(() => {
//     const fetchAttendance = async () => {
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };
//       try {
//         const res = await axios.get(`${API_BASE}/attendance/me`, { headers });
//         setAttendance(res.data);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to fetch attendance reports.');
//         setLoading(false);
//       }
//     };
//     fetchAttendance();
//   }, []);

//   if (loading) return <p>Loading attendance...</p>;
//   if (error) return <p className="text-red-500">{error}</p>;
//   if (attendance.length === 0) return <p>No attendance records found.</p>;

//   return (
//     <div className="container mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-4">My Attendance Reports</h2>
//       <div className="overflow-x-auto bg-white rounded-lg shadow-md">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {attendance.map((record) => (
//               <tr key={record._id}>
//                 <td className="px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{record.class?.className}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                     {record.status}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AttendanceReport() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const profileId = localStorage.getItem('profileId');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        let studentId;
        if (role === 'student') {
          studentId = profileId;
        } else if (role === 'parent') {
          const parentRes = await axios.get(`${API_BASE}/parents/${profileId}`, { headers });
          if (parentRes.data.children.length > 0) {
            studentId = parentRes.data.children[0]._id;
          }
        }
        
        if (!studentId) {
          setError('Student not found.');
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_BASE}/attendance/me`, { headers });
        setAttendance(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch attendance reports.');
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [role, profileId, token]);

  if (loading) return <p>Loading attendance...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (attendance.length === 0) return <p>No attendance records found.</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Attendance Reports</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendance.map((record) => (
              <tr key={record._id}>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.class?.className}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}