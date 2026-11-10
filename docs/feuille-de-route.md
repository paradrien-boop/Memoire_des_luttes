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

- [ ] Clé racine et format de signature des packs
- [ ] Vérification des signatures dans l'application
- [ ] Délégations pour les collectifs locaux, liste de révocation
- [ ] L'atelier du collectif (signature hors ligne, planches de QR)

## Étape 3 : une vraie application hors ligne

Détail des choix et des étapes : [architecture-app.md](architecture-app.md).

- [x] Étape 0 : socle (workspaces, noyau avec règles du jeu et tests, app Vite + Svelte + TypeScript, vérifications automatiques, publication vers Codeberg Pages)
- [x] Étape 1 : parité avec le prototype (base de données du téléphone, tous les écrans, compteur et import de packs testés dans le noyau)
- [ ] Étape 2 : hors ligne et installation


- [ ] Application installable sur l'écran d'accueil, qui fonctionne sans réseau
- [ ] Scan des QR par l'appareil photo
- [ ] Échange de cartes entre deux téléphones par QR

## Étape 4 : le site

- [ ] Page d'installation
- [ ] Espace de débat sur les cartes
- [ ] Annuaire et gestion des clés des collectifs

## Plus tard

- [ ] Application Android avec Bluetooth
