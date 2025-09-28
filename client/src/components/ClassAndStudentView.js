import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ClassAndStudentView() {
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const profileId = localStorage.getItem('profileId');

  useEffect(() => {
    const fetchClassData = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Safety check for user details
      if (!profileId || !token) {
        setError('Login session invalid.');
        setLoading(false);
        return;
      }
      
      try {
        let classIdToFetch = null;

        // 1. Get the Class ID relevant to the user
        if (userRole === 'student') {
            const studentRes = await axios.get(`${API_BASE_URL}/students/${profileId}`, { headers });
            // FIX: Ensure we use the ID of the class object
            classIdToFetch = studentRes.data.class?._id; 
            
        } else if (userRole === 'teacher') {
            const teacherRes = await axios.get(`${API_BASE_URL}/teachers/${profileId}`, { headers });
            // FIX: Ensure we use the ID of the assignedClass object
            classIdToFetch = teacherRes.data.assignedClass?._id; 
            
        } else if (userRole === 'parent') {
            // Parent logic is complex: must fetch Parent -> Child -> Class ID
            const parentRes = await axios.get(`${API_BASE_URL}/parents/${profileId}`, { headers });
            if (parentRes.data.children && parentRes.data.children.length > 0) {
                const studentId = parentRes.data.children[0]._id;
                const studentRes = await axios.get(`${API_BASE_URL}/students/${studentId}`, { headers });
                classIdToFetch = studentRes.data.class?._id;
            }
        }
        
        if (!classIdToFetch) {
            setError('Class not found for your profile. Please check your admin assignment.');
            setLoading(false);
            return;
        }

        // 2. Fetch the Class Data using the correct string ID
        const classDetailsRes = await axios.get(`${API_BASE_URL}/classes/${classIdToFetch}`, { headers });
        
        setClassData(classDetailsRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error Details:", err.response || err);
        setError(err.response?.data?.message || 'Failed to fetch class data. Server error.');
        setLoading(false);
      }
    };
    fetchClassData();
  }, [token, userRole, profileId]);

  if (loading) return <p>Loading class data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!classData) return <p>No class information found for this user.</p>;

  const students = classData.students || [];

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        My Class: {classData.className} {classData.section}
      </h2>
      <p>Class Teacher: {classData.classTeacher?.name || 'Not Assigned'}</p>

      <h3 className="font-bold text-lg mt-6 mb-2">Students in My Class</h3>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roll No.
              </th>
              {userRole === 'teacher' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent Phone
                </th>
              )}
            </tr>
          </thead>
         <tbody className="bg-white divide-y divide-gray-200">
  {students.map((student) => (
    <tr key={student.rollNumber}>
      <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
      <td className="px-6 py-4 whitespace-nowrap">{student.rollNumber}</td>
      {/* FIX: Safely access student.parent.phone */}
      {userRole === 'teacher' && (
        <td className="px-6 py-4 whitespace-nowrap">{student.parent?.phone || 'N/A'}</td> 
      )}
    </tr>
  ))}
</tbody>
        </table>
      </div>
    </div>
  );
}