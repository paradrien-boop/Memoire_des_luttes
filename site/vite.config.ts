import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig, type Plugin } from 'vite'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { assembler } from '../scripts/assembler.mjs'
import { collectifsPublies, lireCles, packsPublies } from '../scripts/publies'
import { empreinte } from '../paquets/noyau/src/index'

const racine = fileURLToPath(new URL('..', import.meta.url))

/** « virtual:mdl-site » : ce que le site affiche, lu dans data/ au moment de la construction. */
function donnees(): Plugin {
  const id = 'virtual:mdl-site'
  const resolu = '\0' + id
  return {
    name: 'mdl-site',
    resolveId: (s) => (s === id ? resolu : undefined),
    load(m) {
      if (m !== resolu) return
      const d = assembler(racine)
      const cles = lireCles(racine)
      const serieDe: Record<string, string> = {}
      for (const p of d.packs) for (const s of p.series) for (const c of s.cartes) serieDe[c] = s.nom
      const site = {
        familles: Object.fromEntries(Object.entries(d.familles).map(([k, f]) => [k, f.libelle])),
        cartes: d.packs.flatMap((p) => p.cartes.map((c) => ({ id: c.id, title: c.title, fam: c.fam, rar: c.rar, statut: c.statut ?? 'a-relire', serie: serieDe[c.id] ?? '', pack: p.nom }))),
        packs: packsPublies(racine).map(({ contenu: _c, ...p }) => p),
        evenements: d.evenements.length,
        collectifs: collectifsPublies(racine),
        cles: { nom: cles.nom, empreintes: cles.racines.map(empreinte), revocations: cles.revocations.length },
        config: JSON.parse(readFileSync(join(racine, 'data/site.json'), 'utf8')),
      }
      return 'export default ' + JSON.stringify(site)
    },
    configureServer(server) {
      server.watcher.add(join(racine, 'data'))
      server.watcher.on('change', (f) => {
        if (!f.startsWith(join(racine, 'data'))) return
        const mod = server.moduleGraph.getModuleById(resolu)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [svelte(), donnees()],
  server: { fs: { allow: ['..'] } },
})
