import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";

export default function FeesManagement() {
  const [classes, setClasses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [structures, setStructures] = useState([]);
  const [formData, setFormData] = useState({
    classId: "",
    feeType: "Tuition",
    amount: "",
    dueDate: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = "http://localhost:5000/api";
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, summaryRes, structuresRes] = await Promise.all([
        axios.get(`${API_BASE}/classes`, { headers }),
        axios.get(`${API_BASE}/fees/summary`, { headers }),
        axios.get(`${API_BASE}/fees/structure`, { headers }),
      ]);
      setClasses(classesRes.data);
      setSummary(summaryRes.data);
      setStructures(structuresRes.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE}/fees/structure`,
        { ...formData },
        { headers }
      );
      setMessage("Fee structure updated successfully ✅");
      setFormData({ classId: "", feeType: "Tuition", amount: "", dueDate: "" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update fee structure.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Fees Management</h2>

      {/* Summary */}
      {summary && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-bold mb-4">Fees Overview</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-100 text-center">
              <p className="text-3xl font-bold">{summary.totalPaid}</p>
              <p>Paid</p>
            </div>
            <div className="p-4 bg-yellow-100 text-center">
              <p className="text-3xl font-bold">{summary.totalPending}</p>
              <p>Pending</p>
            </div>
            <div className="p-4 bg-gray-100 text-center">
              <p className="text-3xl font-bold">{summary.totalFees}</p>
              <p>Total</p>
            </div>
          </div>
        </div>
      )}

      {/* Fee Structure Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-bold mb-4">Set Fee Structure</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Class</label>
            <select
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              required
              className="w-full mt-1 rounded-md"
            >
              <option value="">-- Select Class --</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.className} {c.section}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Fee Type</label>
            <select
              name="feeType"
              value={formData.feeType}
              onChange={handleChange}
              required
              className="w-full mt-1 rounded-md"
            >
              <option value="Tuition">Tuition</option>
              <option value="Exam">Exam</option>
              <option value="Transport">Transport</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className="w-full mt-1 rounded-md"
            />
          </div>
          <div>
            <label>Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              className="w-full mt-1 rounded-md"
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">
              <FaPlus className="inline-block mr-2" /> Set Fee Structure
            </button>
          </div>
        </form>
        {message && <p className="text-green-500 mt-2">{message}</p>}
      </div>

      {/* Fee Structures Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Existing Fee Structures</h3>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Class</th>
              <th className="p-2">Fee Type</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {structures.map((s) => (
              <tr key={s._id}>
                <td className="p-2">{s.class?.className} {s.class?.section}</td>
                <td className="p-2">{s.feeType}</td>
                <td className="p-2">₹{s.amount}</td>
                <td className="p-2">{new Date(s.dueDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
