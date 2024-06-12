import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'chart.js/auto';
import '../../assets/css/styles.css';

const TokenTracker = () => {
  const [usageData, setUsageData] = useState([]);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchUsageData = async () => {
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
      if (response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      setUsageData(response.data.usageHistory);
      toast.success('Usage data fetched successfully');
    } catch (error) {
      console.error('Error fetching usage data:', error.response ? error.response.data : error);
      if (error.response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      toast.error(error.response ? error.response.data.message : 'Error getting data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, []);

  useEffect(() => {
    if (usageData.length > 0) {
      const labels = usageData.map(entry => new Date(entry.date).toLocaleDateString());
      const tokensUsed = usageData.map(entry => entry.tokens);
      const charges = usageData.map(entry => entry.charges);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Tokens Used',
            data: tokensUsed,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          },
          {
            label: 'Charges (USD)',
            data: charges,
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
          },
        ],
      });
    }
  }, [usageData]);

  return (
    <div>
      <div id="header">
        <h1>Token Usage Tracker</h1>
      </div>
      <div id="main">
        <div className="token-tracker">
          {loading ? (
            <p>Loading...</p>
          ) : usageData.length > 0 ? (
            <Bar data={chartData} />
          ) : (
            <p>No usage data found.</p>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default TokenTracker;
