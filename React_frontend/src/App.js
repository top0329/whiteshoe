import React, { useContext, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthProvider, { AuthContext } from './provider/auth-provider';
import Layout from './components/layout/Layout';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import HomePage from './components/pages/HomePage';
import WorkPage from './components/pages/WorkPage';
import DocumentationPage from './components/pages/DocumentationPage';
import SettingsPage from './components/pages/SettingsPage';
import FilesPage from './components/pages/FilesPage';
import BillingPage from './components/pages/BillingPage';
import AccountPage from './components/pages/AccountPage';
import ArbitratePage from './components/pages/ArbitratePage';
import SubscriptionPage from './components/pages/SubscriptionPage';
import UsageHistoryPage from './components/pages/UsageHistoryPage';
import TermAndCondition from './components/common/TermAndCondition';
import PrivacyPolicy from './components/common/PrivacyPolicy';
import TokenTracker from './components/common/TokenTracker';

import axios from 'axios';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Spinner from './components/common/Spinner';

const RoutesComponent = () => {
  const { subscription, isLoggedIn } = useContext(AuthContext);

  if (isLoggedIn == null || subscription == null) return null;

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route
            path='/work'
            element={
              isLoggedIn ? (
                subscription !== 0 ? (
                  <WorkPage />
                ) : (
                  <Navigate to='/subscription' />
                )
              ) : (
                <Navigate to='/login' />
              )
            }
          />
          <Route
            path='/documentation'
            element={
              isLoggedIn ? (
                subscription !== 0 ? (
                  <DocumentationPage />
                ) : (
                  <Navigate to='/subscription' />
                )
              ) : (
                <Navigate to='/login' />
              )
            }
          />
          <Route path='/termsofservice' element={<TermAndCondition />} />
          <Route path='/privacypolicy' element={<PrivacyPolicy />} />
          <Route
            path='/subscription'
            element={
              isLoggedIn ? (
                subscription !== 0 ? (
                  <Navigate to='/work' />
                ) : (
                  <SubscriptionPage />
                )
              ) : (
                <Navigate to='/login' />
              )
            }
          />
          <Route
            path='/settings'
            element={
              isLoggedIn ? (
                subscription !== 0 ? (
                  <SettingsPage />
                ) : (
                  <Navigate to='/subscription' />
                )
              ) : (
                <Navigate to='/login' />
              )
            }
          />
          <Route
            path='/files'
            element={
              subscription !== 0 ? (
                <FilesPage />
              ) : isLoggedIn ? (
                <Navigate to='/subscription' />
              ) : (
                <Navigate to='/login' />
              )
            }
          />
          <Route
            path='/billing'
            element={isLoggedIn ? <BillingPage /> : <Navigate to='/login' />}
          />
          <Route
            path='/account'
            element={isLoggedIn ? <AccountPage /> : <Navigate to='/login' />}
          />
          <Route path='/arbitrate' element={<ArbitratePage />} />
          <Route
            path='/usage-history'
            element={
              isLoggedIn ? <UsageHistoryPage /> : <Navigate to='/login' />
            }
          />
          <Route
            path='/token-tracker'
            element={isLoggedIn ? <TokenTracker /> : <Navigate to='/login' />}
          />
          <Route path='/signup' element={<SignupPage />} />
          <Route path='/login' element={<LoginPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App = () => {
  const [googleClientId, setGoogleClientId] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/config`
        );
        setGoogleClientId(response.data.googleClientId);
      } catch (error) {
        console.error('Failed to fetch configuration:', error);
      }
    };
    fetchConfig();
  }, []);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Spinner />
        <ToastContainer />
        <RoutesComponent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
