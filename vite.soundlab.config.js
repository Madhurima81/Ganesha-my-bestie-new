// Build config for the standalone Sound Lab export (scripts/export-sound-lab.mjs).
// Separate from vite.config.js on purpose: no PWA, no analytics, no scene registry. Only sound-lab.html.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: false, // audio is copied explicitly by the export script (only what the lab uses)
  build: {
    outDir: 'node_modules/.sound-lab-build',
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: { input: 'sound-lab.html' },
  },
});
