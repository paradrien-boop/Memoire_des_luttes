# Application Mémoire des luttes

Construite avec Vite, Svelte 5 et TypeScript. L'architecture est décrite dans [docs/architecture-app.md](../docs/architecture-app.md).

Depuis la racine du dépôt :

```bash
npm run dev
```

## Organisation

| Dossier | Contenu |
|---|---|
| `src/ecrans/` | Un fichier par écran : Manif, Album, Éditeur, Plus |
| `src/composants/` | Éléments réutilisés : carte, mini-carte, révélation du booster, fenêtre, annonce |
| `src/etat/` | L'état du jeu (`jeu.svelte.ts`) et de l'interface (`interface.svelte.ts`) |
| `src/stockage/` | La base de données du téléphone (IndexedDB via Dexie) |
| `src/codes-demo.ts` | Codes de stand de démonstration, en attendant les QR signés |
| `src/styles/` | Couleurs, polices et styles de base |
| `src/donnees.ts` | Le catalogue des cartes |
| `vite.config.ts` | Configuration, dont le module `virtual:mdl-donnees` qui inclut `data/` dans l'app |

## Hors ligne et mises à jour

- `vite-plugin-pwa` produit le manifeste d'installation et le *service worker* (configuration dans `vite.config.ts`). Toute l'app, polices comprises, est gardée sur le téléphone.
- Une nouvelle version n'est jamais appliquée de force : l'app affiche « Une nouvelle version de l'app est prête » et l'utilisateur choisit de redémarrer (`src/etat/mise-a-jour.svelte.ts`).
- Au premier lancement, l'écran d'accueil explique l'app, guide l'installation selon le téléphone, et demande au navigateur de ne jamais effacer les données de l'app (`src/etat/installation.svelte.ts`).
- Icônes : `public/icones/`.

## Tests de bout en bout

```bash
npm run test:e2e
```

Les tests (`app/tests/`) tournent sur une version de l'app construite avec la clé de démonstration (`npm run build:test`). Ils couvrent le parcours, le compteur, l'éditeur, le quiz, les QR signés ou falsifiés, le scan d'une photo de QR, les dons, les packs officiels et locaux, la révocation et le mode avion.

## Page de démonstration

`npm run build:artefact -w app` construit une variante de l'app en **un seul fichier HTML** (`app/dist-artefact/index.html`), sans mode hors ligne ni installation. Elle sert à montrer l'app comme page de démo en ligne. La vraie publication reste la version normale, sur Codeberg Pages.

## Règles

- **Aucune ressource extérieure.** Polices, images et bibliothèques sont incluses dans l'app. La politique de sécurité dans `index.html` bloque tout le reste.
- **Les règles du jeu sont dans le noyau** (`paquets/noyau/`), pas dans les écrans, pour être testées et partagées.
