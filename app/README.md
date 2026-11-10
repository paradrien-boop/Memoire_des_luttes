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

## Règles

- **Aucune ressource extérieure.** Polices, images et bibliothèques sont incluses dans l'app. La politique de sécurité dans `index.html` bloque tout le reste.
- **Les règles du jeu sont dans le noyau** (`paquets/noyau/`), pas dans les écrans, pour être testées et partagées.
