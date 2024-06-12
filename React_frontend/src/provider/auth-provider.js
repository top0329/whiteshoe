import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      // Verify Token
      const verifyToken = async () => {
        try {
          let { data } = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/verify-token`,
            { token }
          );
          if (data.success) {
            setIsLoggedIn(true);
            const decoded = jwtDecode(token);
            const subscription = decoded.subscription;
            setSubscription(subscription);
          }
        } catch (e) {
          console.log(e);
          localStorage.removeItem('token');
        }
      };

      verifyToken();
    } else {
      setIsLoggedIn(false);
      setSubscription(0);
    }
  }, [token]);

  console.log({ isLoggedIn, subscription });

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        subscription,
        setSubscription,
        loading,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
