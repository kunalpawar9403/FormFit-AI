import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const copyIndexTo404 = () => ({
  name: 'copy-index-to-404',
  closeBundle() {
    try {
      const indexPath = path.resolve(__dirname, 'dist', 'index.html');
      const notFoundPath = path.resolve(__dirname, 'dist', '404.html');
      const backendIndexPath = path.resolve(__dirname, '..', 'backend', 'index.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath);
        fs.copyFileSync(indexPath, backendIndexPath);
      }
    } catch (err) {
      console.warn('Could not copy index.html to 404.html:', err);
    }
  },
});

export default defineConfig({
  plugins: [react(), copyIndexTo404()],
  server: {
    port: 5175,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-pdf': ['pdf-lib', 'jspdf'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
});
