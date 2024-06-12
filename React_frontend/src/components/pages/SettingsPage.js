import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/css/styles.css';

function SettingsPage() {
  const [settings, setSettings] = useState({
    defaultLanguage: 'English',
    tone: 'professional',
    bodyOfLaw: [],
    output: 'short',
    token: localStorage.getItem('token'), // Retrieve token from localStorage
  });
  const [jurisdictions, setJurisdictions] = useState({
    states: [],
    countries: []
  });
  const [subscriptionType, setSubscriptionType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const states = [
          "Alaska", "Alabama", "Arkansas", "American Samoa", "Arizona", "California",
          "Colorado", "Connecticut", "District of Columbia", "Delaware", "Florida",
          "Georgia", "Guam", "Hawaii", "Iowa", "Idaho", "Illinois", "Indiana", "Kansas",
          "Kentucky", "Louisiana", "Massachusetts", "Maryland", "Maine", "Michigan",
          "Minnesota", "Missouri", "Mississippi", "Montana", "North Carolina",
          "North Dakota", "Nebraska", "New Hampshire", "New Jersey", "New Mexico",
          "Nevada", "New York", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
          "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee",
          "Texas", "Utah", "Virginia", "Virgin Islands", "Vermont", "Washington",
          "Wisconsin", "West Virginia", "Wyoming"
        ];
        const response = await axios.get('https://restcountries.com/v3.1/all');
        const countries = response.data.map(item => item.name.common);
        setJurisdictions({ states, countries });
        const token = localStorage.getItem('token'); // Ensure the token is up to date
        const subscription = localStorage.getItem('subscriptionType'); // Get subscription type from localStorage
        setSubscriptionType(subscription);

        if (token) {
          const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/getSettings`, { token });
          if (response.data.success) {
            const userSettings = response.data.settings;
            setSettings(prevSettings => ({
              ...prevSettings,
              defaultLanguage: userSettings.defaultLanguage,
              tone: userSettings.tone,
              bodyOfLaw: userSettings.bodyOfLaw,
              output: userSettings.output
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch countries', error);
      }
    };
    fetchData();
  }, []);

  const navigate = useNavigate();

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    const updatedBodyOfLaw = checked
      ? [...settings.bodyOfLaw, value]
      : settings.bodyOfLaw.filter((law) => law !== value);
    setSettings({ ...settings, bodyOfLaw: updatedBodyOfLaw });
  };

  const handleSelectChange = (event) => {
    setSettings({ ...settings, [event.target.name]: event.target.value });
  };

  const handleOutputChange = (event) => {
    if (subscriptionType === 'free' && event.target.value === 'long') {
      toast.error('Long mode is not available for free plan users. Please upgrade your subscription.');
      return;
    }
    setSettings({ ...settings, output: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/settings`, settings);
      if (response.message === `You're logged out. Please login again`) {
        toast.success('Please login again');
        localStorage.removeItem('token');
      }
      navigate('/work');
    } catch (error) {
      console.error('Error changing settings:', error.response ? error.response.data : error);
      if (error.response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem("token");
      }
      toast.error(error.response ? error.response.data.message : 'Error saving settings');
    }
  };

  const languages = ['English', 'Spanish', 'French', 'Portuguese', 'German', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Turkish', 'Italian', 'Hungarian', 'Polish', 'Arabic', 'Hebrew', 'Hindi', 'Urdu'];
  const tones = ['professional', 'formal', 'aggressive', 'plain English'];

  return (
    <div>
      <div id="header">
        <h1>Settings</h1>
      </div>
      <div className='modeDiv'>
        <h4>Output:</h4>
        <table className="output-table">
          <tbody>
            <tr>
              <td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.output === 'short'}
                    onChange={() => handleOutputChange({ target: { value: 'short' } })}
                  />
                  <span className="slider"></span>
                </label>
              </td>
              <td>
                <span className='label'>Short</span>
              </td>
            </tr>
            <tr>
              <td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.output === 'long'}
                    onChange={() => handleOutputChange({ target: { value: 'long' } })}
                    disabled={subscriptionType === 'free'} // Disable the checkbox if the user is on the free plan
                  />
                  <span className="slider"></span>
                </label>
              </td>
              <td>
                <span className='label'>Long</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div id="main">
        <div className="settings-form">
          <form id="settingsForm" onSubmit={handleSubmit}>
            <label htmlFor="defaultLanguage">Default Language:</label>
            <select id="defaultLanguage" name="defaultLanguage" value={settings.defaultLanguage} onChange={handleSelectChange}>
              {languages.map(language => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
            <label htmlFor="tone">Tone:</label>
            <select id="tone" name="tone" value={settings.tone} onChange={handleSelectChange}>
              {tones.map(tone => (
                <option key={tone} value={tone}>{tone}</option>
              ))}
            </select>
            <fieldset>
              <legend>Body of Law:</legend>
              <div className="jurisdictions-section">
                <div>
                  <h4>U.S. States</h4>
                  <table className="states-table">
                    <tbody>
                      {jurisdictions.states.map(state => (
                        <tr key={state} className='state-row'>
                          <td>
                            <input
                              type="checkbox"
                              id={state}
                              name="bodyOfLaw"
                              value={state}
                              onChange={handleCheckboxChange}
                              checked={settings.bodyOfLaw.includes(state)}
                            />
                          </td>
                          <td>
                            <label htmlFor={state}>{state}</label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <h4>Countries</h4>
                  <table className="countries-table">
                    <tbody>
                      {jurisdictions.countries.map(country => (
                        <tr key={country} className='country-row'>
                          <td>
                            <input
                              type="checkbox"
                              id={country}
                              name="bodyOfLaw"
                              value={country}
                              onChange={handleCheckboxChange}
                              checked={settings.bodyOfLaw.includes(country)}
                            />
                          </td>
                          <td>
                            <label htmlFor={country}>{country}</label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </fieldset>
            <button type="submit" id="saveSettingsButton">Save Settings</button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default SettingsPage;
