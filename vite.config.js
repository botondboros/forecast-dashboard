import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT: replace 'forecast-dashboard' below with your actual GitHub repo name
// e.g. if your repo URL is https://github.com/botondboros/balaton-forecast,
// then set base: '/balaton-forecast/'
export default defineConfig({
  plugins: [react()],
  base: '/forecast-dashboard/',
});
