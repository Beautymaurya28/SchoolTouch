import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/announcements`, { headers });
        setAnnouncements(res.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch announcements.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [token]);

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading announcements...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Recent Announcements</h2>
      {announcements.length === 0 ? (
        <p className="text-gray-600">No announcements available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map(announcement => (
            <div key={announcement._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{announcement.title}</h3>
              <p className="text-gray-600 mb-3">{announcement.description || 'No description provided.'}</p>
              {announcement.date && announcement.time && (
                <p className="text-sm text-gray-500 mb-1">
                  <span className="font-medium">Date:</span> {new Date(announcement.date).toLocaleDateString()} at {announcement.time}
                </p>
              )}
              <p className="text-sm text-gray-500 mb-1">
                <span className="font-medium">Target:</span> {announcement.targetRole === 'class' 
                    ? `${announcement.targetClass?.className || 'N/A'} ${announcement.targetClass?.section || ''}` 
                    : announcement.targetRole}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                <span className="font-medium">Posted by:</span> {announcement.createdBy?.name || 'Unknown'} ({announcement.role})
              </p>
              {announcement.attachment && (
                <div className="mt-3">
                  <a 
                    href={`${API_BASE_URL}/${announcement.attachment}`} // Assuming attachments are served from backend
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:underline text-sm"
                  >
                    View Attachment
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}