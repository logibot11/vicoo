
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/vicoo/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'ViCoo – Zarządzanie projektem',
        short_name: 'ViCoo',
        description: 'Aplikacja do zarządzania zadaniami projektu ViCoo',
        theme_color: '#172554',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/vicoo/',
        scope: '/vicoo/',

        icons: [
           {
            src: '/vicoo/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/vicoo/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})

