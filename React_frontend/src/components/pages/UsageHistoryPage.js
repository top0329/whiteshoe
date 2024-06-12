import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/css/styles.css';

function UsageHistoryPage() {
  const [usageHistory, setUsageHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsageHistory = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/usage-history`,
        { params: { token: localStorage.getItem('token') } },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      setUsageHistory(response.data.usage);
      toast.success('Usage history fetched successfully');
    } catch (error) {
      console.error('Error fetching usage history:', error.response ? error.response.data : error);
      if (error.response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      toast.error(error.response ? error.response.data.message : 'Error getting data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageHistory();
  }, []);

  return (
    <div>
      <div id="header">
        <h1>Usage History</h1>
      </div>
      <div id="main">
        <div className="usage-history-info">
          {loading ? (
            <p>Loading...</p>
          ) : usageHistory.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tokens Used</th>
                  <th>Charges</th>
                </tr>
              </thead>
              <tbody>
                {usageHistory.map((entry, index) => (
                  <tr key={index}>
                    <td>{new Date(entry.timestamp * 1000).toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                    <td>{entry.tokens}</td>
                    <td>${(entry.tokens / 1000 * 0.25).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No usage records found.</p>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default UsageHistoryPage;
