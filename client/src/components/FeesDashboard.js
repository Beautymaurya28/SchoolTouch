import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoneyBillWave } from 'react-icons/fa';

export default function FeesDashboard() {
  const [feeDetails, setFeeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false); // for payment modal

  const API_BASE = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const profileId = localStorage.getItem('profileId');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchFees = async () => {
      try {
        let studentId;
        const parentRes = await axios.get(`${API_BASE}/parents/${profileId}`, { headers });
        if (parentRes.data.children && parentRes.data.children.length > 0) {
          studentId = parentRes.data.children[0]._id;
        }

        if (!studentId) {
          setError('Student not found for this parent.');
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_BASE}/fees/child/${studentId}`, { headers });
        setFeeDetails(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch fees.');
        setLoading(false);
      }
    };
    fetchFees();
  }, [role, profileId, token]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!feeDetails || feeDetails.length === 0) return <p>No fee information available.</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Fee Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feeDetails.map((fee, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">{fee.feeType}</h3>
            <p>Amount: ₹{fee.amount}</p>
            <p>Due Date: {new Date(fee.dueDate).toLocaleDateString()}</p>
            <p className="mt-2 font-semibold">
              Status:
              <span className={`ml-2 px-2 py-1 rounded-full text-white ${fee.status === 'Paid' ? 'bg-green-500' : 'bg-red-500'}`}>
                {fee.status}
              </span>
            </p>
            {fee.status !== "Paid" && (
              <button
                className="bg-blue-600 text-white py-2 px-4 rounded-md mt-4"
                onClick={() => setShowPayment(true)}
              >
                <FaMoneyBillWave className="inline-block mr-2" /> Pay Now
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Pay via UPI</h3>
            <img src="/uploads/payment/upi_qr.png" alt="UPI QR Code" className="mx-auto mb-4 w-48 h-48" />
            <p className="mb-2">Scan QR or click link below:</p>
            <a href="upi://pay?pa=school@upi&pn=SchoolName&am=Amount&cu=INR" target="_blank" className="text-blue-500">
              Pay Now via UPI
            </a>
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              onClick={() => setShowPayment(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
