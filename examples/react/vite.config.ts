import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ]
    }
  },
  server: {
    // host: '3ac5-36-229-52-247.ngrok-free.app',
    allowedHosts: ['2967-240e-3a1-4a71-c511-6913-b49-3ae-2e84.ngrok-free.app'],
    host: '0.0.0.0',
    port: 5173,
    hmr: true
  },
  resolve: {
    alias: {
      "node-fetch": "node-fetch/lib/index.js",
      "stream": "stream-browserify",
      "crypto": "crypto-browserify",
    }
  }
})
