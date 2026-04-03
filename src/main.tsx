import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global Fetch Interceptor for Impersonation MVP
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const impersonateId = localStorage.getItem('impersonate_id');
  if (impersonateId) {
    if (typeof args[0] === 'string' && args[0].startsWith('/api')) {
      args[1] = args[1] || {};
      args[1].headers = {
        ...args[1].headers,
        'x-impersonate-id': impersonateId
      };
    }
  }
  return originalFetch(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
