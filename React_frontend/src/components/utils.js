// src/utils.js
export const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    const hostname = window.location.hostname;
    if (hostname === process.env.REACT_APP_FRONTEND_URL) {
      return 'https://www.whiteshoe.net';
    } else if (hostname === process.env.REACT_APP_BACKEND_URL) {
      return 'https://www.whiteshoe.net';
    }
  }
  return process.env.REACT_APP_API_BASE_URL;
};
