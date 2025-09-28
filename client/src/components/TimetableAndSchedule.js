import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./TimetableAndSchedule.css";
import { FaPlus, FaTrash, FaEdit, FaTimes } from 'react-icons/fa'; // FIX: Added FaTimes to the import statement

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const eventTypes = ["Exam", "Holiday", "Event", "Extra Class", "Meeting"];

export default function TimetableAndSchedule() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scheduleFormData, setScheduleFormData] = useState({ title: '', description: '', date: '', startTime: '', endTime: '', type: 'Exam' });

  const API_BASE_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const userRole = localStorage.getItem('role');
  const profileId = localStorage.getItem('profileId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, teachersRes, subjectsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/classes`, { headers }),
          axios.get(`${API_BASE_URL}/teachers`, { headers }),
          axios.get(`${API_BASE_URL}/subjects`, { headers }),
        ]);
        setClasses(classesRes.data);
        setTeachers(teachersRes.data);
        setSubjects(subjectsRes.data);
        setLoading(false);
      } catch (err) {
        setMessage('Failed to fetch data.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  useEffect(() => {
    if (selectedClassId) {
      fetchTimetableAndSchedule();
    }
  }, [selectedClassId]);

  const fetchTimetableAndSchedule = async () => {
    try {
      const timetableRes = await axios.get(`${API_BASE_URL}/timetables/class/${selectedClassId}`, { headers });
      setTimetable(timetableRes.data.schedule);
      const schedulesRes = await axios.get(`${API_BASE_URL}/schedules/class/${selectedClassId}`, { headers });
      setSchedules(schedulesRes.data);
      setMessage('');
    } catch (err) {
      if (err.response?.status === 404) {
          setTimetable(daysOfWeek.map(day => ({ day, periods: [] })));
          setSchedules([]);
          setMessage('No timetable found. Creating a new one.');
      } else {
          setError('Failed to load timetable.');
      }
    }
  };

  const handlePeriodChange = (dayIndex, periodIndex, field, value) => {
      const updatedTimetable = [...timetable];
      updatedTimetable[dayIndex].periods[periodIndex][field] = value;
      setTimetable(updatedTimetable);
  };

  const addPeriod = (dayIndex) => {
      const updatedTimetable = [...timetable];
      const newPeriodNumber = updatedTimetable[dayIndex].periods.length + 1;
      updatedTimetable[dayIndex].periods.push({ periodNumber: newPeriodNumber, startTime: '', endTime: '', subject: '', teacher: '' });
      setTimetable(updatedTimetable);
  };

  const removePeriod = (dayIndex, periodIndex) => {
      const updatedTimetable = [...timetable];
      updatedTimetable[dayIndex].periods.splice(periodIndex, 1);
      setTimetable(updatedTimetable);
  };

  const handleSubmitTimetable = async () => {
      try {
          await axios.post(`${API_BASE_URL}/timetables`, { classId: selectedClassId, schedule: timetable }, { headers });
          setMessage('Timetable saved successfully! ✅');
      } catch (err) {
          setMessage('Failed to save timetable.');
      }
  };
  
  const handleChangeSchedule = (e) => {
      setScheduleFormData({ ...scheduleFormData, [e.target.name]: e.target.value });
  };

  const handleSubmitSchedule = async (e) => {
      e.preventDefault();
      try {
          await axios.post(`${API_BASE_URL}/schedules`, { ...scheduleFormData, classId: selectedClassId }, { headers });
          setMessage('Schedule saved successfully! ✅');
          setScheduleFormData({ title: '', description: '', date: '', startTime: '', endTime: '', type: 'Exam' });
          fetchTimetableAndSchedule();
      } catch (err) {
          setMessage(err.response?.data?.message || 'Action failed.');
      }
  };
  
  const handleDeleteSchedule = async (id) => {
      if (window.confirm('Are you sure you want to delete this schedule?')) {
          try {
              await axios.delete(`${API_BASE_URL}/schedules/${id}`, { headers });
              setMessage('Schedule deleted successfully! ✅');
              fetchTimetableAndSchedule();
          } catch (err) {
              setMessage(err.response?.data?.message || 'Delete failed.');
          }
      }
  };
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Timetable & Schedule Management</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Select Class</label>
        <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="mt-1 block w-full rounded-md" required>
          <option value="">-- Select a Class --</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.className} {c.section}</option>)}
        </select>
      </div>

      {message && <p className="mb-4 text-green-500">{message}</p>}
      
      {selectedClassId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold text-lg mb-2">Weekly Timetable</h3>
            {timetable.map((day, dayIndex) => (
              <div key={day.day} className="bg-white p-6 rounded-lg shadow-md mb-4">
                <h4 className="font-bold text-md mb-2">{day.day}</h4>
                {day.periods.map((period, periodIndex) => (
                  <div key={periodIndex} className="flex space-x-2 items-center mb-1">
                    <span className="font-semibold">{period.periodNumber}.</span>
                    <input type="time" value={period.startTime} onChange={(e) => handlePeriodChange(dayIndex, periodIndex, 'startTime', e.target.value)} className="w-1/6 rounded-md" />
                    <input type="time" value={period.endTime} onChange={(e) => handlePeriodChange(dayIndex, periodIndex, 'endTime', e.target.value)} className="w-1/6 rounded-md" />
                    <select value={period.subject} onChange={(e) => handlePeriodChange(dayIndex, periodIndex, 'subject', e.target.value)} className="w-1/3 rounded-md">
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
                    </select>
                    <select value={period.teacher} onChange={(e) => handlePeriodChange(dayIndex, periodIndex, 'teacher', e.target.value)} className="w-1/3 rounded-md">
                      <option value="">Select Teacher</option>
                      {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                    {userRole === 'admin' && <button onClick={() => removePeriod(dayIndex, periodIndex)} className="text-red-500"><FaTimes /></button>}
                  </div>
                ))}
                {userRole === 'admin' && <button onClick={() => addPeriod(dayIndex)} className="text-green-500 mt-2"><FaPlus className="inline-block" /> Add Period</button>}
              </div>
            ))}
            {userRole === 'admin' && <button onClick={handleSubmitTimetable} className="w-full bg-blue-600 text-white py-2 rounded-md mt-4">Save Timetable</button>}
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Special Schedule & Events</h3>
            {userRole === 'admin' && (
              <form onSubmit={handleSubmitSchedule} className="bg-white p-6 rounded-lg shadow-md mb-4 grid grid-cols-1 gap-4">
                <div>
                    <label>Title</label>
                    <input type="text" name="title" value={scheduleFormData.title} onChange={handleChangeSchedule} className="w-full mt-1 rounded-md" required />
                </div>
                <div>
                    <label>Description</label>
                    <textarea name="description" value={scheduleFormData.description} onChange={handleChangeSchedule} className="w-full mt-1 rounded-md"></textarea>
                </div>
                <div>
                    <label>Date</label>
                    <input type="date" name="date" value={scheduleFormData.date} onChange={handleChangeSchedule} className="w-full mt-1 rounded-md" required />
                </div>
                <div>
                    <label>Time (optional)</label>
                    <input type="time" name="startTime" value={scheduleFormData.startTime} onChange={handleChangeSchedule} className="w-full mt-1 rounded-md" />
                </div>
                <div>
                    <label>Type</label>
                    <select name="type" value={scheduleFormData.type} onChange={handleChangeSchedule} className="w-full mt-1 rounded-md" required>
                        {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">Add Schedule</button>
              </form>
            )}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="font-bold text-md mb-2">Current Events</h4>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {schedules.map(s => (
                            <tr key={s._id}>
                                <td className="px-6 py-4 whitespace-nowrap">{s.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(s.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{s.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {userRole === 'admin' && <button onClick={() => handleDeleteSchedule(s._id)} className="text-red-500"><FaTrash /></button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}