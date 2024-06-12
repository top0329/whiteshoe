import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import '../../assets/css/styles.css';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from 'provider/auth-provider';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [buttonWidth, setButtonWidth] = useState(0);
  const buttonRef = useRef(null);
  const { setIsLoggedIn, setLoading, setSubscription } =
    useContext(AuthContext);

  useEffect(() => {
    if (buttonRef && buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, [buttonRef]);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Successfully logged in.');
        setIsLoggedIn(true);
        localStorage.setItem('token', data.token);
        const decoded = jwtDecode(data.token);
        const subscription = decoded.subscription;
        setSubscription(subscription);

        if (subscription !== 0) {
          navigate('/work');
        } else {
          navigate('/subscription');
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (response) => {
    try {
      setLoading(true);

      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/google-auth`,
        {
          token: response.credential,
        }
      );

      console.log({ data });

      if (data.success) {
        toast.success('Successfully logged in.');
        setIsLoggedIn(true);
        localStorage.setItem('token', data.token);
        const decoded = jwtDecode(data.token);
        const subscription = decoded.subscription;
        setSubscription(subscription);

        if (subscription !== 0) {
          navigate('/work');
        } else {
          navigate('/subscription');
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Google login failed. Please try again.');
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='form-container'>
      <div className='form-box'>
        <h2>Login</h2>
        <form className='login-form' onSubmit={handleLogin}>
          <div className='form-group'>
            <label htmlFor='email'>Email:</label>
            <input
              type='email'
              id='email'
              name='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='password'>Password:</label>
            <input
              type='password'
              id='password'
              name='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <button type='submit' ref={buttonRef} id='loginButton'>
              Login
            </button>
          </div>
        </form>
        {
          <div className='form-group google-login'>
            <div className='divider'></div>
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                onGoogleSuccess(credentialResponse);
              }}
              onError={() => {
                console.log('Login Failed');
              }}
              width={buttonWidth}
            />
          </div>
        }
        <div className='form-footer'>
          <p>
            Not a member?{' '}
            <a href={`${process.env.REACT_APP_FRONTEND_URL}/signup`}>
              Sign up now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
