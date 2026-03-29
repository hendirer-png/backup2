import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from '@/app/App';
import '@/styles/index.css';
import { queryClient } from './src/lib/queryClient';

// Disable console.log only in production (keep for debugging in dev)
if (typeof window !== 'undefined' && typeof console !== 'undefined' && import.meta.env.PROD) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.log = () => {};
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <App />
      </HashRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
