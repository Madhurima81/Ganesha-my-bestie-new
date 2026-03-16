import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import fs from 'fs'
import path from 'path'

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
export default defineConfig({
  plugins: [
    caseSensitivePlugin(),
    react(),
    // PNG → WebP conversion only — SVGs are untouched (clean in Inkscape first)
    ViteImageOptimizer({
      test: /\.(png|jpe?g)$/i,   // only raster images
      png:  { quality: 82 },
      jpeg: { quality: 82 },
      jpg:  { quality: 82 },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      // Use existing public/manifest.json — don't let the plugin override it
      manifest: false,
      workbox: {
        // Precache only JS/CSS/HTML + small icons — NOT full images or audio (too large)
        globPatterns: ['**/*.{js,css,html}', 'icons/*.{png,svg,ico}'],
        // Explicitly exclude large asset folders from precache scan
        globIgnores: ['**/audio/**', '**/images/**', '**/words/**'],
        // Hard cap: skip anything over 500 KB in the precache sweep
        maximumFileSizeToCacheInBytes: 1 * 1024 * 1024,
        // Serve offline.html when a page navigation fails (no connection)
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
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
          // Google Fonts stylesheet: stale-while-revalidate
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
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
    hmr: {
      protocol: 'ws'
    },
    watch: {
      usePolling: true,
      interval: 1000
    }
  },
  
  build: {
    // Optimize for PWA
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          // Core app dependencies
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion'],
          
          // Zone-specific chunks for better code splitting
          'zone-symbol-mountain': [
            './src/zones/symbol-mountain/scenes/modak/NewModakSceneV5',
            './src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV3',
            './src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3',
            './src/zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8'
          ],
          
          'zone-cave-secrets': [
            './src/zones/meaning cave/scenes/VakratundaMahakaya/CaveSceneFixedV1',
            './src/zones/meaning cave/scenes/suryakoti-samaprabha/SuryakotiSceneV2',
            './src/zones/meaning cave/scenes/nirvighnam-kurumedeva/NirvighnamSceneV3',
            './src/zones/meaning cave/scenes/sarvakaryeshu-sarvada/SarvakaryeshuSarvadaV5.jsx'
          ],
          
          'zone-shloka-river': [
            './src/zones/shloka-river/scenes/Scene2/SuryakotiBank',
            './src/zones/shloka-river/scenes/Scene3/NirvighnamChant',
            './src/zones/shloka-river/scenes/scene4/SarvakaryeshuChant',
            './src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale'
          ],
          
          'zone-festival-square': [
            './src/zones/festival-square/Game1-piano/FestivalPianoGame.jsx',
            './src/zones/festival-square/Game2-Rangoli/FestivalRangoliGame.jsx',
            './src/zones/festival-square/game3-cooking/ModakCookingGame.jsx',
            './src/zones/festival-square/Game4-mandapdecor/MandapDecorationGame.jsx'
          ]
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
})