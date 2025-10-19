import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  //base: '/~leochen05/manhunt-hackathon/',
  base: '/', 
  plugins: [react()],
  server: {
    allowedHosts: [
      'gil-rigoristic-eleanor.ngrok-free.dev'  // ngrok domain
    ],
  },
})
