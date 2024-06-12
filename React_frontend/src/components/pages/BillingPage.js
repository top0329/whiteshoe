import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loadStripe } from '@stripe/stripe-js';
import { TailSpin } from 'react-loader-spinner';
import '../../assets/css/styles.css';

require('dotenv').config();

function BillingPage() {
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [usageRecords, setUsageRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const fetchPaymentRecords = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/paymentRecords`,
        { token: localStorage.getItem('token') },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      setPaymentRecords(response.data.subscriptions.data);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error fetching payment records:', error.response ? error.response.data : error);
      if (error.response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      toast.error(error.response ? error.response.data.message : 'Error getting data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageRecords = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_FRONTEND_URL}/usageRecords`,
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
      setUsageRecords(response.data.usage);
      toast.success('Usage records fetched successfully');
    } catch (error) {
      console.error('Error fetching usage records:', error.response ? error.response.data : error);
      if (error.response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      toast.error(error.response ? error.response.data.message : 'Error getting data');
    }
  };

  useEffect(() => {
    fetchPaymentRecords();
    fetchUsageRecords();
  }, []);

  const createSubscription = async () => {
    setSubscriptionLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/subscribe`,
        { token: localStorage.getItem('token') },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      const stripe = await loadStripe('pk_live_51NzAU5EcLvmdIVUAHtBMBqWlOOarJH1fC4w98539qfCtOlNI3RFl1gW0mKTvmjeq9AaibEtGPMFqfklGLsrglGO400YBMhRjmM'); // Replace with your actual Stripe public key
      const result = await stripe.redirectToCheckout({
        sessionId: response.data.session.id,
      });
      if (result.error) {
        console.error(result.error.message);
      }
      fetchPaymentRecords();
      toast.success('Subscription created successfully');
    } catch (error) {
      console.error('Error creating subscription:', error.response ? error.response.data : error);
      if (error.response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      toast.error(error.response ? error.response.data.message : 'Error getting data');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  return (
    <div>
      <div id="header">
        <h1>Billing</h1>
      </div>
      <div id="main">
        <div className="billing-info">
          <h2>Payment Records</h2>
          {loading ? (
            <p>Loading...</p>
          ) : paymentRecords.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="recrd">{new Date(record.start_date * 1000).toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                    <td className="recrd">${record.plan.amount / 100}</td>
                    <td className="recrd">{record.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No payment records found.</p>
          )}

          <h2>Usage Records</h2>
          {loading ? (
            <p>Loading...</p>
          ) : usageRecords.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tokens Used</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {usageRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="recrd">{new Date(record.timestamp * 1000).toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                    <td className="recrd">{record.tokens}</td>
                    <td className="recrd">${(record.tokens / 1000) * (record.rate / 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No usage records found.</p>
          )}
          <button onClick={createSubscription} disabled={subscriptionLoading}>
            {subscriptionLoading ? <TailSpin color="#00BFFF" height={20} width={20} /> : 'Create Subscription'}
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default BillingPage;
