// Vite setup for local dev proxying and production chunk splitting.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Keep frequently used dependencies in stable vendor chunks.
        manualChunks: {
          'vendor-charts': ['recharts'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-core': ['@tanstack/react-query', 'axios', 'zustand'],
        },
      },
    },
  },
});
