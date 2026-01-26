import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
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
            './src/zones/meaning-cave/scenes/VakratundaMahakaya/CaveSceneFixedV1',
            './src/zones/meaning-cave/scenes/suryakoti-samaprabha/SuryakotiSceneV2',
            './src/zones/meaning-cave/scenes/nirvighnam-kurumedeva/NirvighnamSceneV3',
            './src/zones/meaning-cave/scenes/sarvakaryeshu-sarvada/SarvakaryeshuSarvadaV5.jsx'
          ],
          
          'zone-shloka-river': [
            './src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified',
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