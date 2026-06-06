import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://stulance-platform-eccxame4gff9hhgp.southeastasia-01.azurewebsites.net',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})