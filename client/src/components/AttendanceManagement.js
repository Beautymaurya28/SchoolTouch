// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { format } from 'date-fns';

// export default function AttendanceManagement() {
//   const [classes, setClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState('');
//   const [students, setStudents] = useState([]);
//   const [attendance, setAttendance] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   const API_BASE = 'http://localhost:5000/api';

//   useEffect(() => {
//     const fetchClasses = async () => {
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };
//       try {
//         const res = await axios.get(`${API_BASE}/classes`, { headers });
//         setClasses(res.data);
//       } catch (err) {
//         setMessage('Failed to load classes.');
//       }
//     };
//     fetchClasses();
//   }, []);

//   useEffect(() => {
//     const fetchStudentsByClass = async () => {
//       if (!selectedClass) return;
//       setLoading(true);
//       setMessage('');
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };
//       try {
//         const res = await axios.get(`${API_BASE}/students?classId=${selectedClass}`, { headers });
//         setStudents(res.data);
//         setLoading(false);
//       } catch (err) {
//         setMessage('Failed to load students.');
//         setLoading(false);
//       }
//     };
//     fetchStudentsByClass();
//   }, [selectedClass]);

//   const handleAttendanceChange = (studentId, status) => {
//     setAttendance(prev => ({ ...prev, [studentId]: status }));
//   };

//   const handleSubmit = async () => {
//     if (!selectedClass || Object.keys(attendance).length === 0) {
//       return setMessage('Please select a class and mark attendance for at least one student.');
//     }

//     const attendanceRecords = students.map(student => ({
//       studentId: student._id,
//       status: attendance[student._id] || 'Absent',
//     }));

//     const token = localStorage.getItem('token');
//     const headers = { Authorization: `Bearer ${token}` };
//     try {
//       await axios.post(`${API_BASE}/attendance/mark`, {
//         classId: selectedClass,
//         attendanceRecords,
//         date: format(new Date(), 'yyyy-MM-dd'),
//       }, { headers });
//       setMessage('Attendance marked successfully! ✅');
//       setAttendance({});
//     } catch (err) {
//       setMessage('Failed to submit attendance.');
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-4">Mark Attendance</h2>
//       <div className="mb-4">
//         <label className="block text-gray-700">Select Class</label>
//         <select
//           value={selectedClass}
//           onChange={(e) => setSelectedClass(e.target.value)}
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
//         >
//           <option value="">-- Select a Class --</option>
//           {classes.map((c) => (
//             <option key={c._id} value={c._id}>{c.className} {c.section}</option>
//           ))}
//         </select>
//       </div>

//       {message && <p className="mb-4 text-green-500">{message}</p>}
//       {loading && <p>Loading students...</p>}

//       {students.length > 0 && (
//         <>
//           <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No.</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {students.map((student) => (
//                 <tr key={student._id}>
//                   <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{student.rollNumber}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <select
//                       value={attendance[student._id] || 'Absent'}
//                       onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
//                       className="rounded-md border-gray-300 shadow-sm"
//                     >
//                       <option value="Present">Present</option>
//                       <option value="Absent">Absent</option>
//                       <option value="Leave">On Leave</option>
//                     </select>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <button
//             onClick={handleSubmit}
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//           >
//             Submit Attendance
//           </button>
//         </>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

export default function AttendanceManagement() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${API_BASE}/classes`, { headers });
        setClasses(res.data);
      } catch (err) {
        setError('Failed to load classes.');
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchStudentsByClass = async () => {
      if (!selectedClass) return;
      setLoading(true);
      setMessage('');
      try {
        const res = await axios.get(`${API_BASE}/students?classId=${selectedClass}`, { headers });
        setStudents(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load students.');
        setLoading(false);
      }
    };
    fetchStudentsByClass();
  }, [selectedClass]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedClass || Object.keys(attendance).length === 0) {
      return setMessage('Please select a class and mark attendance for at least one student.');
    }

    const attendanceRecords = students.map(student => ({
      studentId: student._id,
      status: attendance[student._id] || 'Absent',
    }));

    try {
      await axios.post(`${API_BASE}/attendance/mark`, {
        classId: selectedClass,
        attendanceRecords,
        date: format(new Date(), 'yyyy-MM-dd'),
      }, { headers });
      setMessage('Attendance marked successfully! ✅');
      setAttendance({});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit attendance.');
    }
  };
  
  if (loading) return <p>Loading students...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Mark Attendance</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Select Class</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">-- Select a Class --</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.className} {c.section}</option>
          ))}
        </select>
      </div>

      {message && <p className="mb-4 text-green-500">{message}</p>}
      
      {students.length > 0 && (
        <>
          <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.rollNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={attendance[student._id] || 'Absent'}
                      onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Leave">On Leave</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleSubmit}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit Attendance
          </button>
        </>
      )}
    </div>
  );
}