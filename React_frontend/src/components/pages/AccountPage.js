import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../assets/css/styles.css';

function AccountPage() {
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [email, setEmail] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token available');
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/subscription-details`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Error fetching subscription details:', error.response ? error.response.data : error);
      if (error.response && error.response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      toast.error(error.response ? error.response.data.message : 'Error fetching subscription details');
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token available');
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/change-password`,
        {
          token: token,
          newPassword: password.newPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      setPassword({ currentPassword: '', newPassword: '' });
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error changing password:', error.response ? error.response.data : error);
      if (error.response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      toast.error(error.response ? error.response.data.message : 'Error changing password');
    }
  };

  const handleChangeEmail = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token available');
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/change-email`,
        {
          token: token,
          newEmail: email,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      setEmail('');
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error changing email:', error.response ? error.response.data : error);
      if (error.response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      toast.error(error.response ? error.response.data.message : 'Error changing email');
    }
  };

  const handleSubscriptionChange = async (newPlan) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token available');
      }

      setSubscriptionLoading(true);

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/change-subscription`,
        {
          token: token,
          plan: newPlan,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      toast.success('Subscription changed successfully');
      fetchSubscriptionDetails(); // Refresh subscription details
    } catch (error) {
      console.error('Error changing subscription:', error.response ? error.response.data : error);
      if (error.response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      toast.error(error.response ? error.response.data.message : 'Error changing subscription');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSubscriptionCancel = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token available');
      }

      setSubscriptionLoading(true);

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/cancel-subscription`,
        {
          token: token,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      toast.success('Subscription cancelled successfully');
      fetchSubscriptionDetails(); // Refresh subscription details
    } catch (error) {
      console.error('Error cancelling subscription:', error.response ? error.response.data : error);
      if (error.response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
      }
      toast.error(error.response ? error.response.data.message : 'Error cancelling subscription');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  return (
    <div className="account-page">
      <nav className="navbar">
        {/* Add navigation links here if needed */}
      </nav>
      <main className="main">
        <div className="account-info">
          <h3>Subscription Details</h3>
          {subscription ? (
            <div>
              <p>Current Plan: {subscription.plan}</p>
              <p>Next Billing Date: {new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
              <button onClick={() => handleSubscriptionChange('free')} disabled={subscriptionLoading}>Switch to Free Plan</button>
              <button onClick={() => handleSubscriptionChange('usage')} disabled={subscriptionLoading}>Switch to Usage Plan</button>
              <button onClick={() => handleSubscriptionChange('member')} disabled={subscriptionLoading}>Switch to Membership Plan</button>
              <button onClick={handleSubscriptionCancel} disabled={subscriptionLoading}>Cancel Subscription</button>
            </div>
          ) : (
            <p>Loading subscription details...</p>
          )}
          <h3>Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <label htmlFor="currentPassword">Current Password:</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              required
              value={password.currentPassword}
              onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
            />
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              required
              value={password.newPassword}
              onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
            />
            <button type="submit">Change Password</button>
          </form>
          <h3>Change Email</h3>
          <form onSubmit={handleChangeEmail}>
            <label htmlFor="newEmail">New Email:</label>
            <input
              type="email"
              id="newEmail"
              name="newEmail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">Change Email</button>
          </form>
        </div>
      </main>
      <footer className="footer">
        {/* Footer content */}
      </footer>
    </div>
  );
}

export default AccountPage;
