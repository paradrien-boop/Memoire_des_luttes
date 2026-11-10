# Feuille de route

## Fait

- [x] Concept, principes et ton
- [x] Prototype web ([`prototype/index.html`](../prototype/index.html)) : compteur de manif, boosters, codes de stand, album par séries, éditeur avec rubriques par famille, cartes d'événement, export et import de packs
- [x] Pack de départ « La Commune de Paris, 1871 » : 16 cartes, à relire
- [x] Ce dépôt

## Étape 1 : un contenu solide

- [ ] Relire les 16 cartes du pack de départ (faits, sources, dates)
- [x] L'application lit ses cartes depuis `data/` (le prototype via `prototype/donnees.js`, l'app au moment du build)
- [ ] Écrire un deuxième pack

## Étape 2 : les signatures

- [x] Format de signature des packs (Ed25519 sur JSON canonique)
- [x] Vérification des signatures dans l'application (Plus › Packs)
- [x] Délégations pour les collectifs locaux, liste de révocation
- [x] L'atelier du collectif (`npm run atelier` : clés, signature, délégations, planches de QR)
- [ ] **Créer la vraie clé racine** du collectif, sur un ordinateur hors ligne, et la mettre dans `data/cles/racine.json`

## Étape 3 : une vraie application hors ligne

Détail des choix et des étapes : [architecture-app.md](architecture-app.md).

- [x] Étape 0 : socle (workspaces, noyau avec règles du jeu et tests, app Vite + Svelte + TypeScript, vérifications automatiques, publication vers Codeberg Pages)
- [x] Étape 1 : parité avec le prototype (base de données du téléphone, tous les écrans, compteur et import de packs testés dans le noyau)
- [x] Étape 2 : hors ligne et installation (testé en mode avion dans un navigateur ; reste à tester sur de vrais téléphones Android et iPhone une fois publié)


- [ ] Application installable sur l'écran d'accueil, qui fonctionne sans réseau
- [x] Scan des QR par l'appareil photo (ou d'une photo de QR, ou du code tapé)
- [x] Codes de stand et cartes d'événement signés, avec dates de validité
- [x] Échange de cartes entre deux téléphones par QR (doubles et cartes perso)

## Tests

- [x] Tests de bout en bout dans le dépôt (`npm run test:e2e`) : parcours, compteur, éditeur, quiz, QR signés et falsifiés, scan d'une photo, dons, packs officiels et locaux, révocation, mode avion. Lancés à chaque envoi sur GitHub.
- [ ] Tester sur de vrais téléphones Android et iPhone (après publication sur Codeberg)

## En parallèle : quiz du jour et mascotte

- [x] Quiz du jour, chat qui grandit, quartier qui se construit (voir [quiz-et-mascotte.md](quiz-et-mascotte.md))
- [x] Vérifier les questions écrites dans `scripts/valider.mjs`
- [ ] Écrire des questions dans les cartes
- [ ] Dessins définitifs

## Étape 4 : le site

- [ ] Page d'installation
- [ ] Espace de débat sur les cartes
- [ ] Annuaire et gestion des clés des collectifs

## Plus tard

- [ ] Application Android avec Bluetooth
