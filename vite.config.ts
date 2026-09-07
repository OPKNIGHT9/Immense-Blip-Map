import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base is './' so the build works from any path — a GitHub Pages project
// site (user.github.io/sd-zonecreator/), a user site, or a plain static host.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1200
  },
  optimizeDeps: {
    include: ['lucide-react']
  }
});
