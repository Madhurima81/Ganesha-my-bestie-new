import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import fs from 'fs'
import path from 'path'
import annotationsPlugin from './src/dev/viteAnnotationsPlugin.js'

// Custom plugin to enforce case-sensitive imports (catches issues that would fail on Linux)
function caseSensitivePlugin() {
  return {
    name: 'case-sensitive',
    resolveId(source, importer) {
      if (!importer || !source.startsWith('.')) return null;

      const importerDir = path.dirname(importer);
      const resolvedPath = path.resolve(importerDir, source);

      // Add common extensions if not present
      const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '.css', '.json'];

      for (const ext of extensions) {
        const fullPath = resolvedPath + ext;
        if (fs.existsSync(fullPath)) {
          const dir = path.dirname(fullPath);
          const basename = path.basename(fullPath);
          const actualFiles = fs.readdirSync(dir);
          const actualFile = actualFiles.find(f => f.toLowerCase() === basename.toLowerCase());

          if (actualFile && actualFile !== basename) {
            this.error(
              `Case mismatch: imported "${basename}" but file is "${actualFile}"\n` +
              `  in ${importer}`
            );
          }
          break;
        }
      }
      return null;
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    caseSensitivePlugin(),
    annotationsPlugin(),
    react(),
    // PNG → WebP conversion only — SVGs are untouched (clean in Inkscape first)
    // Skip icons folder to avoid optimization issues
    ViteImageOptimizer({
      test: /\.(png|jpe?g)$/i,   // only raster images
      exclude: ['**/icons/**'],   // Don't optimize icons
      png:  { quality: 82 },
      jpeg: { quality: 82 },
      jpg:  { quality: 82 },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      // Use existing public/manifest.json — don't let the plugin override it
      manifest: false,
      workbox: {
        // Precache only the app shell — entry HTML + the JS/CSS needed before
        // React mounts (index + vendor chunks) + small icons. Per-scene chunks
        // (Modak, Pond, Family Tree, etc.) are NOT precached — with 22 scenes
        // across 5 zones the shell used to sweep in every scene's code on first
        // install (210 entries / ~8.3MB), even ones a child never opens. Those
        // now cache on demand via the runtimeCaching rule below, the first time
        // the dynamic import() in App.jsx's SCENE_MAPPING actually loads one.
        globPatterns: ['index.html', 'offline.html', 'assets/index-*.{js,css}', 'assets/vendor-*.js', 'icons/*.{png,svg,ico}'],
        // Hard cap: skip anything over 3 MB in the precache sweep
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Serve offline.html when a page navigation fails (no connection)
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          // Scene/component chunks not in the app shell: fetched normally on
          // first visit to that scene, then served from cache after.
          {
            urlPattern: /\/assets\/.+\.(js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'ganesha-chunks',
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // Audio: cache-first, keep indefinitely
          {
            urlPattern: /\/audio\/.+\.(mp3|wav)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ganesha-audio',
              expiration: { maxEntries: 300 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // Images not in build output (public/images): cache-first, 30 days
          {
            urlPattern: /\/images\/.+\.(png|jpg|jpeg|svg|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ganesha-images',
              expiration: { maxEntries: 150, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // Images imported inside a scene's own assets folder (e.g. Modak's
          // ./assets/images/*) end up in the build's /assets/ folder, not
          // /images/ — the rule above never matched them, so every scene's
          // own art was re-downloaded from network on every single visit.
          {
            urlPattern: /\/assets\/.+\.(png|jpe?g|webp|svg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ganesha-scene-images',
              expiration: { maxEntries: 400, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // Google Fonts stylesheet: cache-first to avoid offline revalidate fetch errors
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 5, maxAgeSeconds: 365 * 24 * 60 * 60 }
            }
          },
          // Google Fonts files: cache-first, 1 year
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  
  server: {
    host: true,   // expose on local network so iPad/Android can connect via IP
    hmr: {
      protocol: 'ws'
    },
    watch: {
      usePolling: true,
      interval: 1000
    }
  },
  
  // Strip console.* and debugger from production builds only — the app logs
  // child names/progress everywhere, which shouldn't reach users' consoles.
  // Dev keeps logs for debugging.
  esbuild: command === 'build' ? { drop: ['console', 'debugger'] } : undefined,

  build: {
    // Optimize for PWA
    rollupOptions: {
      output: {
        // Manual chunking for better caching.
        // Function form, not the old { 'vendor-react': ['react', 'react-dom'] }
        // object map — that form only matches the exact specifiers listed, so
        // main.jsx's `import ReactDOM from 'react-dom/client'` (a different
        // specifier) fell through and shipped the whole DOM renderer inside
        // the main chunk instead of this one. Matching by path catches every
        // subpath of a package.
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          // Sentry/PostHog/Supabase are dynamic-imported (see analytics.js,
          // errorMonitoring.js, supabase.js) specifically so they don't block
          // first paint. Without an explicit name here, Rollup auto-names
          // dynamic-import chunks "index-*" — which collides with the SW's
          // app-shell precache glob (assets/index-*.js) and would precache
          // these ~450KB/170KB/60KB SDKs eagerly anyway, defeating the point.
          if (id.includes('node_modules/@sentry')) {
            return 'lazy-sentry';
          }
          if (id.includes('node_modules/posthog-js')) {
            return 'lazy-posthog';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'lazy-supabase';
          }
          // Zone chunks removed — the dynamic import() map in App.jsx
          // (SCENE_MAPPING) already gives per-scene code splitting; the old
          // entries referenced stale scene versions pulled in via AppV2/V3.
        }
      }
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Source maps for debugging (disable in production)
    sourcemap: false,
    
    // Minification
  // Minification (using default esbuild)
minify: true
  },
  
  // PWA Configuration
  publicDir: 'public',
  
  // Asset handling
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg', '**/*.mp3', '**/*.wav'],
  
  // Optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
    exclude: []
  }
}))
