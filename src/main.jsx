import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BalatonDashboard from './BalatonDashboard.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BalatonDashboard />
  </StrictMode>
);
