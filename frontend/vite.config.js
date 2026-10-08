import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const generateRouteFallbacks = () => ({
  name: 'generate-route-fallbacks',
  closeBundle() {
    try {
      const indexPath = path.resolve(__dirname, 'dist', 'index.html');
      if (!fs.existsSync(indexPath)) return;

      const htmlContent = fs.readFileSync(indexPath, 'utf-8');

      // 404 fallback
      fs.writeFileSync(path.resolve(__dirname, 'dist', '404.html'), htmlContent);

      // Backend fallback
      const backendDir = path.resolve(__dirname, '..', 'backend');
      fs.writeFileSync(path.resolve(backendDir, 'index.html'), htmlContent);

      const routes = [
        'tools',
        'photo',
        'photo/prepare',
        'photo/result',
        'signature',
        'signature/prepare',
        'document',
        'document/scan',
        'pdf',
        'pdf/tools',
        'presets',
        'history',
        'settings',
        'help',
        'privacy',
        'terms',
        'app',
        'plans',
        'pricing',
        'login',
        'signup',
        'profile',
      ];

      for (const route of routes) {
        const routeDir = path.resolve(__dirname, 'dist', route);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(path.resolve(routeDir, 'index.html'), htmlContent);
        fs.writeFileSync(path.resolve(__dirname, 'dist', `${route.replace(/\//g, '-')}.html`), htmlContent);
      }
    } catch (err) {
      console.warn('Could not generate route fallbacks:', err);
    }
  },
});

export default defineConfig({
  plugins: [react(), generateRouteFallbacks()],
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
