import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Dynamic import or chunk loading error safety handler
window.addEventListener('error', (event) => {
  const isChunkError = event.message && (
    event.message.includes('dynamically imported module') ||
    event.message.includes('Failed to fetch') ||
    event.message.includes('Loading chunk') ||
    event.message.includes('chunk-load-error')
  );
  if (isChunkError) {
    console.warn('Dynamic asset import failed, reloading to load fresh bundle...', event);
    const lastReload = sessionStorage.getItem('last_chunk_error_reload');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload) > 8000) {
      sessionStorage.setItem('last_chunk_error_reload', now.toString());
      window.location.reload();
    }
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (reason) {
    const isChunkRejection = 
      (typeof reason.message === 'string' && reason.message.includes('dynamically imported module')) ||
      (reason.stack && reason.stack.includes('Failed to fetch')) ||
      (typeof reason.message === 'string' && reason.message.includes('Failed to fetch'));
    
    if (isChunkRejection) {
      console.warn('Unhandled dynamic module rejection, performing page refresh...', reason);
      const lastReload = sessionStorage.getItem('last_chunk_error_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload) > 8000) {
        sessionStorage.setItem('last_chunk_error_reload', now.toString());
        window.location.reload();
      }
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
