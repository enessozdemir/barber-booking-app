import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss()
  ],
  server: {
    host: true, // --host flag'i ile aynı, tüm network interface'lerinden erişim
    allowedHosts: [
      '.railway.app', // Tüm Railway subdomain'lerine izin ver
      'localhost',
    ],
  },
  preview: {
    host: true, // Production preview için de host erişimi
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    strictPort: true,
  },
})
