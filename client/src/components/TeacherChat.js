import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');
const API_BASE_URL = 'http://localhost:5000/api';

export default function TeacherChat() {
  const [parents, setParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const teacherId = localStorage.getItem('profileId');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/chat/parents/${teacherId}`, { headers });
        setParents(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch parents.');
        setLoading(false);
      }
    };
    fetchParents();

    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [teacherId, token]);

  const handleSelectParent = async (parent) => {
    setSelectedParent(parent);
    setMessages([]);
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/history/${teacherId}/${parent._id}`, { headers });
      setMessages(res.data);
    } catch (err) {
      setError('Failed to fetch chat history.');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim() && selectedParent) {
      const messageData = {
        senderId: teacherId,
        recipientId: selectedParent._id,
        senderRole: 'Teacher',
        recipientRole: 'Parent',
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
        <h3 className="font-bold text-lg mb-4">Parents of My Students</h3>
        <ul>
          {parents.map((parent) => (
            <li
              key={parent._id}
              onClick={() => handleSelectParent(parent)}
              className={`cursor-pointer p-2 my-1 rounded hover:bg-gray-200 ${selectedParent?._id === parent._id ? 'bg-gray-300' : ''}`}
            >
              {parent.name || parent.phone}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4 flex flex-col">
        {selectedParent ? (
          <>
            <div className="bg-gray-100 p-4 border-b">
              <h3 className="font-bold">{selectedParent.name || selectedParent.phone}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender.toString() === teacherId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`rounded-lg p-2 max-w-sm ${msg.sender.toString() === teacherId ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
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
            Select a parent to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}