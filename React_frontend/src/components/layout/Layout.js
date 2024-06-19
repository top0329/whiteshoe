import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorBoundary from '../common/ErrorBoundary';
import { AuthContext } from 'provider/auth-provider';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import '../../assets/css/styles.css';
import 'react-dropdown/style.css';

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  // const toggleMenu = () => {
  //   setIsMenuOpen(!isMenuOpen);
  // };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    console.log('calling handleLogout');
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (
        window.google &&
        window.google.translate &&
        window.google.translate.TranslateElement
      ) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,es,fr,de,it,pt,zh-CN,ja,ko,ar',
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          'google_translate_element'
        );
      } else {
        console.error('Google Translate script did not load properly.');
      }
    };

    const addGoogleTranslate = () => {
      if (!document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = `https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`;
        script.async = true;
        script.onload = () => {
          if (
            window.google &&
            window.google.translate &&
            window.google.translate.TranslateElement
          ) {
            window.googleTranslateElementInit();
          } else {
            console.error(
              'Google Translate script loaded but google.translate is not available.'
            );
          }
        };
        script.onerror = () => {
          console.error('Failed to load the Google Translate script.');
        };
        document.body.appendChild(script);
      }
    };

    addGoogleTranslate();
  }, []);

  return (
    <ErrorBoundary>
      <div className='layout-container'>
        <header className='header'>
          <img
            src={`/assets/WS_logo.png`}
            style={{ height: '50px', marginRight: '10px' }}
            alt='Logo'
          />
          <h1>Whiteshoe</h1>
        </header>
        <div className='navbar-container'>
          <nav className='navbar'>
            {/* <button className='menu-toggle'>
              <div className='bar'></div>
              <div className='bar'></div>
              <div className='bar'></div>
            </button> */}
            <ul className={isMenuOpen ? 'open' : ''}>
              <li>
                <Link to='/' onClick={closeMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link to='/work' onClick={closeMenu}>
                  Work
                </Link>
              </li>
              <li>
                <Link to='/documentation' onClick={closeMenu}>
                  Documentation
                </Link>
              </li>
              <li>
                <Link to='/arbitrate' onClick={closeMenu}>
                  Arbitrate
                </Link>
              </li>
              {!isLoggedIn && (
                <li>
                  <Link to='/signup' onClick={closeMenu}>
                    Start
                  </Link>
                </li>
              )}
              {window.innerWidth <= 768 && (
                <>
                  <li>
                    <Link to='/settings' onClick={closeMenu}>
                      Settings
                    </Link>
                  </li>
                  <li>
                    <Link to='/files' onClick={closeMenu}>
                      Files
                    </Link>
                  </li>
                  <li>
                    <Link to='/account' onClick={closeMenu}>
                      Account
                    </Link>
                  </li>
                  <li>
                    <Link to='/billing' onClick={closeMenu}>
                      Billing
                    </Link>
                  </li>
                  <li>
                    <Link to='/privacypolicy' onClick={closeMenu}>
                      Privacy Policy
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
        <div className='main-content'>
          <main className='content'>{children}</main>
          {isLoggedIn && (
            <aside className='sidebar'>
              <div className='sidebar-tab'>
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  className='dropdown-icon'
                />
              </div>
              <ul>
                <li>
                  <Link to='/settings'>Settings</Link>
                </li>
                <li>
                  <Link to='/files'>Files</Link>
                </li>
                <li>
                  <Link to='/billing'>Billing</Link>
                </li>
                <li>
                  <Link to='/account'>Account</Link>
                </li>
                <li>
                  <Link onClick={handleLogout}>Logout</Link>
                </li>
              </ul>
            </aside>
          )}
        </div>
        <footer className='footer'>
          <p>Copyright © 2024 Web3 Services, LLC. All rights reserved.</p>
          <div
            id='google_translate_element'
            className='translate-element'
          ></div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
