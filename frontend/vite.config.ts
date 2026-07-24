import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Enregistrement manuel (main.tsx) plutôt que le script auto-injecté : celui-ci ne
      // vérifie qu'une fois au chargement, jamais ensuite. Une PWA rouverte depuis l'écran
      // d'accueil ne fait pas toujours un vrai rechargement de page (juste un "resume"), donc
      // elle ratait les mises à jour bien plus souvent qu'un onglet de navigateur classique.
      injectRegister: false,
      includeAssets: ['onglet.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Nexio',
        short_name: 'Nexio',
        description: 'CRM de suivi de recherche d\'emploi et de prospection LinkedIn',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/dashboard',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cache l'app shell (JS/CSS/HTML) pour un chargement rapide et un minimum de contenu
        // hors-ligne ; les appels API restent toujours en direct (pas de cache de données ici,
        // une base de prospection obsolète serait pire qu'une erreur réseau claire).
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
