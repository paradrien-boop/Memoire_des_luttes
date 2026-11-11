# Mémoire des luttes

Une application de cartes à collectionner pour les manifs. On gagne des boosters en étant présent dans la rue. Chaque carte raconte un morceau de l'histoire des luttes : une personne, un événement, une idée, un livre, un chant.

L'application ne demande **ni compte, ni GPS, ni réseau** pendant la manif. Tout reste sur le téléphone.

L'app publiée (phase de test) : https://paradrien-boop.github.io/memoire-des-luttes-publication/app/ · le site : https://paradrien-boop.github.io/memoire-des-luttes-publication/

Ce dépôt est **le centre du projet** : les idées, la documentation, la base de cartes et le code. Le site et les mises à jour de l'application viendront chercher leurs données ici.

## Organisation du dépôt

| Dossier | Contenu |
|---|---|
| [`docs/`](docs/) | Le concept, les choix techniques et les décisions prises |
| [`data/`](data/) | La base de données : familles de cartes, packs, cartes d'événement, collectifs |
| [`paquets/noyau/`](paquets/noyau/) | La logique partagée : formats, règles du jeu, plus tard signatures |
| [`app/`](app/) | L'application (Vite, Svelte, TypeScript) |
| [`prototype/`](prototype/) | Le premier prototype, gardé comme référence |
| [`site/`](site/) | Le site web : installation, cartes, packs, collectifs, clés, participation |
| [`scripts/`](scripts/) | Outils : vérification des cartes, plus tard signature des packs |

## Par où commencer

1. [Le concept](docs/concept.md)
2. [Les familles de cartes](docs/cartes-et-familles.md)
3. [Signatures, collectifs et confiance](docs/signatures-et-collectifs.md)
4. [Architecture de l'application](docs/architecture-app.md)
5. [Feuille de route](docs/feuille-de-route.md)
6. [Publication](docs/publication.md)
7. [Tester sur de vrais téléphones](docs/tester-sur-telephone.md)
8. [Idées en attente](docs/idees.md)

Pour proposer une carte ou une correction : voir [CONTRIBUER.md](CONTRIBUER.md).

## Modifier les cartes

Les cartes se modifient **uniquement dans `data/`**. Ensuite :

```bash
node scripts/valider.mjs
```

```bash
node scripts/construire.mjs
```

Le premier script vérifie les cartes. Le second régénère `prototype/donnees.js`, le fichier que le prototype charge. L'app, elle, lit `data/` automatiquement au moment où elle est construite.

## Travailler sur l'app

Il faut Node.js 22 ou plus récent.

```bash
npm install
```

```bash
npm run dev
```

La première commande installe les outils, la seconde lance l'app en local et la recharge à chaque modification, y compris dans `data/`. Autres commandes : `npm test` (tests du noyau), `npm run check` (vérification des types), `npm run build` (construction de l'app).

À chaque envoi sur GitHub, une action vérifie les cartes, lance les tests et construit l'app. L'app est publiée (GitHub Pages pour la phase de test) : voir [docs/publication.md](docs/publication.md).

## Licences

- **Code** : GNU AGPL v3 ou ultérieure ([LICENSE](LICENSE)).
- **Contenu des cartes** : CC BY-SA 4.0. C'est obligatoire, car une partie des textes est adaptée de Wikipédia.

Détails dans [LICENCES.md](LICENCES.md).
