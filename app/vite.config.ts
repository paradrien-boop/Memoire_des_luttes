import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig, type Plugin } from 'vite'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { assembler } from '../scripts/assembler.mjs'

const racine = fileURLToPath(new URL('..', import.meta.url))

/**
 * Fournit le module « virtual:mdl-donnees » : le contenu de data/, lu au moment du build.
 * Les cartes sont donc incluses dans l'app, qui n'a besoin d'aucun réseau pour les lire.
 */
function donnees(): Plugin {
  const id = 'virtual:mdl-donnees'
  const resolu = '\0' + id
  return {
    name: 'mdl-donnees',
    resolveId: (source) => (source === id ? resolu : undefined),
    load: (module) => (module === resolu ? 'export default ' + JSON.stringify(assembler(racine)) : undefined),
    configureServer(server) {
      // En développement, recharger la page quand une carte change dans data/.
      server.watcher.add(join(racine, 'data'))
      server.watcher.on('change', (fichier) => {
        if (!fichier.startsWith(join(racine, 'data'))) return
        const m = server.moduleGraph.getModuleById(resolu)
        if (m) server.moduleGraph.invalidateModule(m)
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}

export default defineConfig({
  // Chemins relatifs : l'app fonctionne quel que soit le dossier où Codeberg Pages la sert.
  base: './',
  plugins: [
    svelte(),
    donnees(),
    // Rend l'app installable et utilisable sans réseau : tout est gardé sur le téléphone.
    VitePWA({
      registerType: 'prompt', // une nouvelle version ne s'installe que si l'utilisateur l'accepte
      injectRegister: false, // l'enregistrement est fait dans src/etat/mise-a-jour.svelte.ts
      includeAssets: ['favicon.svg', 'icones/apple-touch-icon.png'],
      manifest: {
        name: 'Mémoire des luttes',
        short_name: 'Mémoire des luttes',
        description: "Cartes à collectionner sur l'histoire des luttes. Sans compte, sans GPS, sans réseau.",
        lang: 'fr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#E9E6E1',
        theme_color: '#1C1816',
        icons: [
          { src: 'icones/icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icones/icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icones/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Tout ce qu'il faut pour fonctionner en mode avion (polices en woff2 seulement, le format que lisent tous les téléphones récents).
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: { fs: { allow: ['..'] } },
})
