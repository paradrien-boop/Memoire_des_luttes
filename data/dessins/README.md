# Les dessins

Tous les dessins de l'app (le personnage et ses objets, les adversaires, le chat, le quartier) existent d'abord **en code**. On peut les **remplacer un par un** en déposant ici un fichier **SVG**, ou **PNG à fond transparent**, avec le bon nom. L'app utilise le fichier s'il existe, et le dessin en code sinon : rien ne casse si un dessin manque.

## Comment faire

1. **Partir d'un modèle** : `modeles/` contient chaque dessin actuel, déjà dans le bon cadre (ex. `modeles/ennemis/censeur.svg`). Ou partir d'un **gabarit** vide : `gabarits/` (personnage, ennemi, chat, quartier), avec ses repères.
2. **Dessiner** dans son logiciel (Inkscape, Illustrator, Affinity, Procreate…), **sans changer la taille du document** : le cadre et le point (0,0) doivent rester les mêmes, sinon le dessin sera décalé dans l'app.
3. **Enregistrer** sous le bon nom, au bon endroit (tableau plus bas), par exemple `data/dessins/ennemis/censeur.svg`. Supprimer d'abord le calque « Repères » d'un gabarit. Fond transparent.
4. **Vérifier** : `npm run valider` contrôle les noms, formats et tailles. `npm run dev`, puis l'adresse `#dessins` : la planche montre tous les dessins et se met à jour dès qu'un fichier est déposé.
5. **Envoyer** sur `main` : le dessin arrive dans l'app à la publication suivante (et dans l'APK Android).

## Les noms

| Dessin | Fichier | Cadre |
|---|---|---|
| Corps du personnage (coiffure 0 courte, 1 longue, 2 frisée) | `personnage/base-0.svg` … `base-2.svg` | 120 × 180, (0,0) entre les pieds |
| … dans la pose « victoire » (bras droit levé) ou « sonné » | `personnage/base-1-victoire.svg`, `personnage/base-1-sonne.svg` | idem |
| Un objet du personnage (seul, sans le corps) | `personnage/objets/<objet>.svg` | idem, à sa place sur le corps |
| … dans la pose « victoire » | `personnage/objets/<objet>-victoire.svg` | idem |
| Un adversaire | `ennemis/<dessin>.svg` | 120 × 180, regarde vers la gauche |
| … qui s'enfuit | `ennemis/<dessin>-fuite.svg` | idem |
| Le chat, stade 0 à 4 | `chat/stade-0.svg` … `stade-4.svg` | 140 × 140, (0,0) au sol |
| … endormi | `chat/stade-2-endormi.svg` | idem |
| Le fond du quartier (ciel, immeubles, rue) | `quartier/fond.svg`, la nuit : `quartier/fond-nuit.svg` | 400 × 300 |
| Un élément du quartier, niveau 1 à 3 | `quartier/<famille>-<niveau>.svg` | 400 × 300, fond transparent, dans sa zone (voir `gabarits/quartier.svg`) |

- **Objets** : `porte-voix`, `accordeon`, `tambour`, `banderole`, `pancarte`, `bonnet-phrygien`, `livre`, `journal`, `binocles`, `foulard-rouge`, `tablier`, `fichu`, `casquette`, `bleu-de-chauffe`, `sac-de-tracts`, `lunettes`, `lavalliere`, `rose`, `drapeau`, `beret`, `cocarde`, `lanterne`, `echarpe`, `mariniere`.
- **Adversaires** : `soldat`, `proprietaire`, `patron`, `censeur`, `mouchard`, `general`.
- **Familles** (éléments du quartier) : `personnalite` (fresque), `evenement` (banderole, barricade), `lieu` (plaque, monument), `mesure` (Bourse du travail), `concept` (atelier), `courant` (affiches), `livre` (bibliothèque), `chant` (kiosque).

## Règles à respecter

- **La peau du personnage en magenta `#FF00FF`** : l'app la remplace par le teint choisi par chaque personne. Ne pas utiliser ce magenta pour autre chose.
- **Les objets se superposent au corps**, dans cet ordre : dos, corps, haut, main gauche, main droite, col, tête, visage. Un objet se dessine donc seul, sur fond transparent, exactement là où il se porte.
- **Un fichier par dessin**, 300 Ko au plus (les dessins sont inclus dans l'app, qui doit rester légère). Préférer le SVG : plus léger, et net à toutes les tailles.
- **Pas de script, pas de lien vers l'extérieur** dans un SVG (refusé par `npm run valider`), et les images éventuelles intégrées au fichier.
- Ce qui bouge reste dessiné en code : les passants, les pigeons, la fumée, les étoiles de la nuit, la pancarte du chat les jours de manif, les « POUF ! » des batailles.
- Les adversaires sont des **types d'époque**, jamais des personnes réelles reconnaissables.

## Mettre à jour les modèles

Après un changement des dessins en code : lancer `npm run dev`, puis `node scripts/exporter-dessins.mjs` (il faut Playwright). Les modèles de `modeles/` sont réécrits.
