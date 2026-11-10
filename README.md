# Mémoire des luttes

Une application de cartes à collectionner pour les manifs. On gagne des boosters en étant présent dans la rue. Chaque carte raconte un morceau de l'histoire des luttes : une personne, un événement, une idée, un livre, un chant.

L'application ne demande **ni compte, ni GPS, ni réseau** pendant la manif. Tout reste sur le téléphone.

Ce dépôt est **le centre du projet** : les idées, la documentation, la base de cartes et le code. Le site et les mises à jour de l'application viendront chercher leurs données ici.

## Organisation du dépôt

| Dossier | Contenu |
|---|---|
| [`docs/`](docs/) | Le concept, les choix techniques et les décisions prises |
| [`data/`](data/) | La base de données : familles de cartes, packs, cartes d'événement, collectifs |
| [`app/`](app/) | L'application (pour l'instant, le prototype web) |
| [`site/`](site/) | Le futur site web (installation, débat, collectifs) |
| [`scripts/`](scripts/) | Outils : vérification des cartes, plus tard signature des packs |

## Par où commencer

1. [Le concept](docs/concept.md)
2. [Les familles de cartes](docs/cartes-et-familles.md)
3. [Signatures, collectifs et confiance](docs/signatures-et-collectifs.md)
4. [Feuille de route](docs/feuille-de-route.md)
5. [Idées en attente](docs/idees.md)

Pour proposer une carte ou une correction : voir [CONTRIBUER.md](CONTRIBUER.md).

## Vérifier les données

```bash
node scripts/valider.mjs
```

## Licences

- **Contenu des cartes** : CC BY-SA 4.0. C'est obligatoire, car une partie des textes est adaptée de Wikipédia.
- **Code** : licence libre à choisir (voir [les idées en attente](docs/idees.md)).
