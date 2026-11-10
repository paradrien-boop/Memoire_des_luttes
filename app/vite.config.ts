import { svelte } from '@sveltejs/vite-plugin-svelte'
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
  plugins: [svelte(), donnees()],
  server: { fs: { allow: ['..'] } },
})
