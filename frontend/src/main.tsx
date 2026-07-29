import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import { App } from './App'

// Enregistrement manuel plutôt que le script auto-injecté par défaut : celui-ci ne revérifie
// jamais après le premier chargement. Une PWA rouverte depuis l'écran d'accueil ne fait
// souvent qu'un "resume" (pas un vrai rechargement), donc elle ratait les mises à jour bien
// plus longtemps qu'un onglet de navigateur classique. On force une vérification à chaque
// retour au premier plan, en plus du enregistrement initial. `updateSW(true)` est obligatoire
// ici : sans l'argument, le nouveau service worker reste en attente tant que ce client reste
// ouvert, ce qui n'arrive quasiment jamais sur une PWA mobile juste suspendue/reprise par l'OS
// (contrairement à un onglet desktop classique, régulièrement fermé/rouvert).
const updateSW = registerSW({ immediate: true })

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    updateSW(true)
  }
})

;(() => {
  const stored = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (stored === 'dark' || (!stored && prefersDark)) {
    document.documentElement.classList.add('dark')
  }
})()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
