# Application

Le prototype tient en deux fichiers :

| Fichier | Rôle |
|---|---|
| `index.html` | L'application : écrans, règles du jeu, éditeur |
| `donnees.js` | Les cartes, **généré automatiquement** à partir de `data/`. Ne pas le modifier à la main. |

Pour l'essayer, ouvre `index.html` dans un navigateur. Aucun serveur n'est nécessaire.

Après une modification dans `data/`, régénère les données :

```bash
node scripts/construire.mjs
```

## Ce que fait le prototype

Compteur de manif, boosters avec garantie de rareté, codes de stand (`COMMUNE-71`, `MUR-28-MAI`, `18-MARS-2027`), album par séries, éditeur avec rubriques par famille, cartes d'événement scellées, export et import de packs, bouton « Tout effacer ».

Les codes de stand sont encore écrits dans `index.html` : ce sont des codes de démonstration. Dans la vraie version, ce seront des QR signés.
