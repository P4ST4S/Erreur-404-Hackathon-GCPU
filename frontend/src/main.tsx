import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import './globals.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
