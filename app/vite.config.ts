import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { defineConfig, type BuildOptions, type Plugin } from 'vite'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { assembler } from '../scripts/assembler.mjs'
import { lireDessins } from '../scripts/dessins.mjs'

const racine = fileURLToPath(new URL('..', import.meta.url))

/**
 * Variante « démo en ligne » (MDL_ARTEFACT=1) : toute l'app dans un seul fichier HTML,
 * sans mode hors ligne (les service workers n'y sont pas permis), pour la montrer comme page de démonstration.
 * La vraie publication reste la version normale.
 */
const artefact = process.env.MDL_ARTEFACT === '1'
const atelierSeul = process.env.MDL_ATELIER === '1'
const ici = fileURLToPath(new URL('.', import.meta.url))

/**
 * Variante « application Android » (MDL_ANDROID=1), emballée par Capacitor (dossier android/).
 * Pas de service worker (l'app est déjà sur le téléphone) ; « Chercher de nouveaux packs »
 * et les mises à jour de l'app interrogent le site publié, dont l'adresse est dans data/site.json.
 */
const android = process.env.MDL_ANDROID === '1'
const adresseSite: string = JSON.parse(readFileSync(join(racine, 'data/site.json'), 'utf8')).adresse
/** Numéro de version de l'app (le numéro de construction sur GitHub), comparé pour proposer les mises à jour. */
const version = process.env.MDL_VERSION ?? 'dev'

/** Dans l'application Android, la politique de sécurité autorise aussi le site (et rien d'autre). */
function pageAndroid(): Plugin {
  return {
    name: 'mdl-page-android',
    transformIndexHtml: (html) =>
      html
        .replace("connect-src 'self'", `connect-src 'self' ${new URL(adresseSite).origin}`)
        .replace(/\s*<link rel="manifest"[^>]*>/, ''),
  }
}

/**
 * Clé de démonstration (data/cles/demo.json) : sa partie secrète est publique.
 * Elle n'est acceptée qu'en développement, dans la page de démo et dans les tests (MDL_DEMO=1),
 * JAMAIS dans l'app publiée.
 */
function demo(actif: boolean): Plugin {
  const id = 'virtual:mdl-demo'
  const resolu = '\0' + id
  return {
    name: 'mdl-demo',
    resolveId: (source) => (source === id ? resolu : undefined),
    load(module) {
      if (module !== resolu) return
      if (!actif) return 'export default null'
      const cle = JSON.parse(readFileSync(join(racine, 'data/cles/demo.json'), 'utf8'))
      return 'export default ' + JSON.stringify({ publique: cle.publique, secrete: cle.secrete })
    },
  }
}

/**
 * « virtual:mdl-dessins » : les dessins déposés dans data/dessins/ (voir data/dessins/README.md),
 * inclus dans l'app au moment de la construction. Un dessin absent garde le dessin écrit en code.
 */
function dessins(): Plugin {
  const id = 'virtual:mdl-dessins'
  const resolu = '\0' + id
  return {
    name: 'mdl-dessins',
    resolveId: (s) => (s === id ? resolu : undefined),
    load: (m) => (m === resolu ? 'export default ' + JSON.stringify(lireDessins(racine).dessins) : undefined),
    configureServer(server) {
      // En développement, la planche #dessins se met à jour dès qu'un fichier est déposé ou modifié.
      const dossier = join(racine, 'data/dessins')
      server.watcher.add(dossier)
      const recharger = (f: string) => {
        if (!f.startsWith(dossier)) return
        const mod = server.moduleGraph.getModuleById(resolu)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', recharger)
      server.watcher.on('change', recharger)
      server.watcher.on('unlink', recharger)
    },
  }
}

/** Retire de la page ce qui ne sert qu'à la version installable. */
function pageDeDemo(): Plugin {
  return {
    name: 'mdl-page-de-demo',
    transformIndexHtml: (html) =>
      html
        .replace(/\s*<meta http-equiv="Content-Security-Policy"[^>]*>/, '')
        .replace(/\s*<link rel="(manifest|apple-touch-icon|icon)"[^>]*>/g, '')
        .replace(/\s*<meta name="apple-mobile-web-app[^>]*>/g, ''),
  }
}

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

export default defineConfig(({ command }) => {
  const modeDemo = command === 'serve' || artefact || process.env.MDL_DEMO === '1'
  return {
  // Chemins relatifs : l'app fonctionne quel que soit le dossier où Codeberg Pages la sert.
  base: './',
  define: {
    'import.meta.env.VITE_ARTEFACT': JSON.stringify(artefact),
    'import.meta.env.VITE_DEMO': JSON.stringify(modeDemo),
    'import.meta.env.VITE_ANDROID': JSON.stringify(android),
    'import.meta.env.VITE_SITE': JSON.stringify(adresseSite),
    'import.meta.env.VITE_VERSION': JSON.stringify(version),
  },
  // Deux pages : l'app (index.html) et l'atelier de dessin (atelier.html). MDL_ATELIER=1 : l'atelier seul, en un fichier.
  build: (atelierSeul
    ? { outDir: 'dist-atelier', rollupOptions: { input: { atelier: join(ici, 'atelier.html') } } }
    : artefact
      ? { outDir: 'dist-artefact' }
      : android
        ? {}
        : { rollupOptions: { input: { app: join(ici, 'index.html'), atelier: join(ici, 'atelier.html') } } }) as BuildOptions,
  plugins: [
    svelte(),
    donnees(),
    demo(modeDemo),
    dessins(),
    ...(artefact || atelierSeul ? [viteSingleFile(), pageDeDemo()] : []),
    ...(android ? [pageAndroid()] : []),
    // Rend l'app installable et utilisable sans réseau : tout est gardé sur le téléphone.
    VitePWA({
      disable: artefact || android || atelierSeul,
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
}
})
