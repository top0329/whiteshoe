import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../assets/css/styles.css';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    console.log({ selectedPlan });

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/subscribe`,
        { plan: selectedPlan, token: localStorage.getItem('token') },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log({ response });

      if (selectedPlan !== 'free') {
        const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_TEST_KEY);
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({
          sessionId: response.data.session.id,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Redirecting to checkout...');
        }
      } else {
        toast.success(
          'You selected free plan. This will be available after 7 days and you will be able to use the app for 2000 tokens per day.'
        );
      }
    } catch (error) {
      console.error(
        'Error creating checkout session:',
        error.response ? error.response.data : error
      );
      if (
        error.response.data.message === `You're logged out. Please login again`
      ) {
        localStorage.removeItem('token');
        toast.error('Please login again');
        navigate('/login');
      } else {
        toast.error(
          error.response
            ? error.response.data.message
            : 'Error creating checkout session'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='subscription-page'>
      <h1 style={{ marginBottom: '30px' }}>Choose Your Plan</h1>
      <div className='plan-options'>
        <div
          className={`plan ${selectedPlan === 'free' ? 'selected' : ''}`}
          onClick={() => setSelectedPlan('free')}
        >
          <h2>Free</h2>
          <p>Lasts one week</p>
          <p>Settings short mode only</p>
          <p>10 responses every 24 hours</p>
        </div>
        <div
          className={`plan ${selectedPlan === 'usage' ? 'selected' : ''}`}
          onClick={() => setSelectedPlan('usage')}
        >
          <h2>Usage</h2>
          <p>No monthly fee</p>
          <p>Full access, no rate limit</p>
          <p>Charges $0.10 per 1000 tokens of output</p>
        </div>
        <div
          className={`plan ${selectedPlan === 'member' ? 'selected' : ''}`}
          onClick={() => setSelectedPlan('member')}
        >
          <h2>Membership</h2>
          <p>$50 monthly fee</p>
          <p>Full access, no rate limit</p>
          <p>Charges $0.05 per 1000 tokens</p>
        </div>
      </div>
      <button
        onClick={handleSubscribe}
        className='subscribe-button'
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Subscribe'}
      </button>
    </div>
  );
};

export default SubscriptionPage;
