import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MyBorrowedBooks() {
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = 'http://localhost:5000/api/library';

  useEffect(() => {
    const fetchBooks = async () => {
      const studentId = localStorage.getItem('studentId');
      const token = localStorage.getItem('token');
      if (!studentId || !token) {
        setError('User not found. Please log in again.');
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/student/${studentId}`, { headers: { Authorization: `Bearer ${token}` } });
        setMyBooks(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch borrowed books.');
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  if (loading) return <p>Loading my books...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (myBooks.length === 0) return <p>You have not borrowed any books yet.</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Borrowed Books</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {myBooks.map(book => (
              <tr key={book._id}>
                <td className="px-6 py-4 whitespace-nowrap">{book.book.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{book.book.author}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(book.issueDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}