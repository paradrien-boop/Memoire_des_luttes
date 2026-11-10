# Application Mémoire des luttes

Construite avec Vite, Svelte 5 et TypeScript. L'architecture est décrite dans [docs/architecture-app.md](../docs/architecture-app.md).

Depuis la racine du dépôt :

```bash
npm run dev
```

## Organisation

| Dossier | Contenu |
|---|---|
| `src/ecrans/` | Un fichier par écran |
| `src/composants/` | Éléments réutilisés |
| `src/styles/` | Couleurs, polices et styles de base |
| `src/donnees.ts` | Le catalogue des cartes |
| `vite.config.ts` | Configuration, dont le module `virtual:mdl-donnees` qui inclut `data/` dans l'app |

## Règles

- **Aucune ressource extérieure.** Polices, images et bibliothèques sont incluses dans l'app. La politique de sécurité dans `index.html` bloque tout le reste.
- **Les règles du jeu sont dans le noyau** (`paquets/noyau/`), pas dans les écrans, pour être testées et partagées.
