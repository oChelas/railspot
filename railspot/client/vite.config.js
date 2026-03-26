import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Atualiza o Service Worker automaticamente
      manifest: {
        name: 'RailSpot',
        short_name: 'RailSpot',
        description: 'Horários, Estações e Ocorrências Ferroviárias',
        theme_color: '#020617', // Ajustado para combinar com o dark mode da tua app
        background_color: '#020617',
        display: 'standalone', // Faz com que a app pareça nativa no telemóvel
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Estratégias de Caching Dinâmico para a API
        runtimeCaching: [
          {
            // Fazer cache da lista de estações (CacheFirst porque muda pouco)
            urlPattern: /\/api\/stations/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'stations-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 semana
              }
            }
          },
          {
            // Horários e Ocorrências (NetworkFirst para tentar ir buscar o dado mais fresco)
            urlPattern: /\/api\/(schedules|occurrences)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dynamic-data-cache',
              networkTimeoutSeconds: 3, // Falha rápido (3s) se estiver num túnel
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 dia
              }
            }
          }
        ]
      },
      // Ativa a geração do Service Worker durante o npm run dev
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
})