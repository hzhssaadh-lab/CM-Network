import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || event.reason?.toString() || '';
  if (msg.includes('Failed to fetch') || msg.includes('fetch')) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (msg.includes('Failed to fetch') || msg.includes('fetch')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
