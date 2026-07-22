import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ui/ErrorBoundary.tsx';
import { initAnalytics } from './utils/analytics.ts';
import './index.css';

// Defer GA4 & PostHog tracking to idle callback to avoid main-thread blocking during boot
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => initAnalytics());
  } else {
    setTimeout(initAnalytics, 1000);
  }
} else {
  initAnalytics();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
