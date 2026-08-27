import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy Copernicus OAuth token endpoint (avoids browser CORS block)
      '/cdse-auth': {
        target: 'https://identity.dataspace.copernicus.eu',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/cdse-auth/, ''),
      },
      // Proxy Sentinel Hub Process API
      '/sentinel-process': {
        target: 'https://sh.dataspace.copernicus.eu',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/sentinel-process/, ''),
      },
    },
  },
})
