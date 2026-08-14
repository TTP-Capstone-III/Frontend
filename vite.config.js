import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Transform React JSX and enable React's development refresh behavior.
  plugins: [react()]
});
