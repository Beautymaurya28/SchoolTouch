import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function LibraryManagement() {
  const [books, setBooks] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [addBookData, setAddBookData] = useState({ title: '', author: '', isbn: '', quantity: 1 });
  const [issueBookData, setIssueBookData] = useState({ studentId: '', bookId: '' });
  const [message, setMessage] = useState('');
  const API_BASE = 'http://localhost:5000/api/library';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const booksRes = await axios.get(`${API_BASE}/books`, { headers });
      setBooks(booksRes.data);
      const issuedRes = await axios.get(`${API_BASE}/issued`, { headers });
      setIssuedBooks(issuedRes.data);
    } catch (err) {
      setMessage('Failed to load data.');
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_BASE}/books`, addBookData, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Book added successfully!');
      setAddBookData({ title: '', author: '', isbn: '', quantity: 1 });
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add book.');
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_BASE}/issue`, issueBookData, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Book issued successfully!');
      setIssueBookData({ studentId: '', bookId: '' });
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to issue book.');
    }
  };

  const handleReturnBook = async (issueId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API_BASE}/return/${issueId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Book returned successfully!');
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to return book.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Library Management</h2>
      {message && <p className="mt-4 text-green-500">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Add Book Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Add New Book</h3>
          <form onSubmit={handleAddBook}>
            {/* Inputs for title, author, isbn, quantity */}
          </form>
        </div>
        {/* Issue Book Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Issue Book to Student</h3>
          <form onSubmit={handleIssueBook}>
            {/* Inputs for studentId, bookId */}
          </form>
        </div>
      </div>

      {/* All Books Table */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-bold mb-4">All Books</h3>
        {/* Table to display books */}
      </div>

      {/* Issued Books Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Currently Issued Books</h3>
        {/* Table to display issuedBooks with a return button */}
      </div>
    </div>
  );
}