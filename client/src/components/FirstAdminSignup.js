import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function FirstAdminSignup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const API_BASE = 'http://localhost:5000/api';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/public/first-admin-signup`, formData);
      setMessage(res.data.message);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      navigate('/admin/dashboard');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Signup failed.');
    }
  };

  return (
    <div className="login-container">
      <div className="left-side">
        {/* You can add a special image or message here */}
      </div>
      <div className="right-side">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>First-Time Admin Signup</h2>
          <p>This page will be disabled after the first use.</p>
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          <button type="submit" className="login-btn">Create Admin Account</button>
          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  );
}