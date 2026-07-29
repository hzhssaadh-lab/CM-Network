import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const originalError = console.error;
console.error = function(...args) {
  if (args.some(arg => {
    if (typeof arg === 'string' && (arg.includes('Failed to fetch') || arg.includes('fetch'))) return true;
    if (arg && arg.message && (arg.message.includes('Failed to fetch') || arg.message.includes('fetch'))) return true;
    return false;
  })) {
    return;
  }
  originalError.apply(console, args);
};

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
