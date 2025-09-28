import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');
const API_BASE_URL = 'http://localhost:5000/api';

export default function ParentChat() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const parentId = localStorage.getItem('profileId');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/chat/teachers/${parentId}`, { headers });
        setTeachers(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch teachers.');
        setLoading(false);
      }
    };
    fetchTeachers();

    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [parentId, token]);

  const handleSelectTeacher = async (teacher) => {
    setSelectedTeacher(teacher);
    setMessages([]);
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/history/${parentId}/${teacher._id}`, { headers });
      setMessages(res.data);
    } catch (err) {
      setError('Failed to fetch chat history.');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim() && selectedTeacher) {
      const messageData = {
        senderId: parentId,
        recipientId: selectedTeacher._id,
        senderRole: 'Parent',
        recipientRole: 'Teacher',
        messageText,
      };
      socket.emit('sendMessage', messageData);
      setMessageText('');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex h-screen border rounded-lg overflow-hidden">
      <div className="w-1/4 bg-gray-100 border-r p-4">
        <h3 className="font-bold text-lg mb-4">Teachers</h3>
        <ul>
          {teachers.map((teacher) => (
            <li
              key={teacher._id}
              onClick={() => handleSelectTeacher(teacher)}
              className={`cursor-pointer p-2 my-1 rounded hover:bg-gray-200 ${selectedTeacher?._id === teacher._id ? 'bg-gray-300' : ''}`}
            >
              {teacher.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4 flex flex-col">
        {selectedTeacher ? (
          <>
            <div className="bg-gray-100 p-4 border-b">
              <h3 className="font-bold">{selectedTeacher.name}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender.toString() === parentId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`rounded-lg p-2 max-w-sm ${msg.sender.toString() === parentId ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                    {msg.messageText}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-100 border-t flex">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 border rounded-l-lg p-2"
                placeholder="Type a message..."
              />
              <button type="submit" className="bg-blue-600 text-white rounded-r-lg px-4 py-2">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a teacher to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}