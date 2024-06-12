import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from 'provider/auth-provider';
import { jwtDecode } from 'jwt-decode';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [buttonWidth, setButtonWidth] = useState(0);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  const { setIsLoggedIn, setLoading } = useContext(AuthContext);

  useEffect(() => {
    if (buttonRef && buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, [buttonRef]);

  const handleSignup = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/signup`,
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
        localStorage.setItem('token', data.token);
        toast.success('Successfully logged in.');
        setIsLoggedIn(true);
        navigate('/subscription');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Signup failed:', error);
      toast.error('Signup failed. Please try again later.');
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
          clientId: response.clientId,
          token: response.credential,
        }
      );

      console.log({ data });

      if (data.success) {
        toast.success('Successfully logged in.');
        localStorage.setItem('token', data.token);
        setIsLoggedIn(true);
        const decoded = jwtDecode(data.token);
        const subscription = decoded.subscription;
        if (subscription !== 0) {
          navigate('/work');
        } else {
          navigate('/subscription');
        }
      } else {
        toast.error('Login failed!');
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
        <h2>Sign Up</h2>
        <form className='signup-form' onSubmit={handleSignup}>
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
            <button type='submit' ref={buttonRef} id='signupButton'>
              Sign Up
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
            Already a member? <a href='/login'>Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
