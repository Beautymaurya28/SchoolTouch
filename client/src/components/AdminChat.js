import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');
const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminChat() {
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const adminId = localStorage.getItem('profileId');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/chat/admin/partners`, { headers });
        setPartners(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch chat partners.');
        setLoading(false);
      }
    };
    fetchPartners();

    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [adminId, token]);

  const handleSelectPartner = async (partner) => {
    setSelectedPartner(partner);
    setMessages([]);
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/history/${adminId}/${partner.id}`, { headers });
      setMessages(res.data);
    } catch (err) {
      setError('Failed to fetch chat history.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex h-screen border rounded-lg overflow-hidden">
      <div className="w-1/4 bg-gray-100 border-r p-4">
        <h3 className="font-bold text-lg mb-4">Chat Partners</h3>
        <ul>
          {partners.map((partner) => (
            <li
              key={partner.id}
              onClick={() => handleSelectPartner(partner)}
              className={`cursor-pointer p-2 my-1 rounded hover:bg-gray-200 ${selectedPartner?.id === partner.id ? 'bg-gray-300' : ''}`}
            >
              {partner.name} ({partner.role})
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4 flex flex-col">
        {selectedPartner ? (
          <>
            <div className="bg-gray-100 p-4 border-b">
              <h3 className="font-bold">{selectedPartner.name} ({selectedPartner.role})</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender.toString() === adminId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`rounded-lg p-2 max-w-sm ${msg.sender.toString() === adminId ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                    {msg.messageText}
                  </div>
                </div>
              ))}
            </div>
            {/* Admin can send messages */}
            <form className="p-4 bg-gray-100 border-t flex">
                <input type="text" className="flex-1 border rounded-l-lg p-2" placeholder="Admin can reply..." readOnly />
                <button type="submit" className="bg-blue-600 text-white rounded-r-lg px-4 py-2">
                  Send
                </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat partner.
          </div>
        )}
      </div>
    </div>
  );
}