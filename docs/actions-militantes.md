# Les actions militantes

Au-delà de la manif, l'app propose d'autres actions : tracter, coller des affiches, faire grève, soutenir une caisse de grève, transmettre une histoire de lutte… Chaque personne choisit **celles qu'elle se sent de mener**, et gagne des fragments et des boosters quand elle les déclare.

## Où ça se passe dans l'app

| Où | Quoi |
|---|---|
| **Profil** › Mes actions militantes | Cocher les actions qu'on se sent de mener, et choisir son **objectif de la semaine** (1, 2, 3, 5 ou 7 actions). |
| **Agir** (l'ancien écran Manif) › Mes actions | Les actions choisies, chacune avec sa récompense et un bouton « Je l'ai fait » ; la progression vers l'objectif de la semaine. |

Un jour de manif validé (une heure au compteur) compte aussi comme une action pour l'objectif.

## Tout se règle dans un fichier : `data/actions.json`

Le collectif ajoute, retire ou modifie les actions, leurs récompenses et leurs limites dans ce fichier. `npm run valider` le vérifie ; l'app le reçoit à la prochaine construction.

```json
{
  "id": "tractage",
  "categorie": "rue",
  "nom": "Distribuer des tracts",
  "description": "Sur un marché, à la sortie d'une gare ou d'une entreprise.",
  "conseil": "Facultatif : un conseil pratique ou juridique, affiché à la demande.",
  "recompense": { "fragments": 2 },
  "plafond": { "nombre": 1, "par": "jour" }
}
```

| Champ | Valeurs |
|---|---|
| `categorie` | une des `categories` du fichier (« Dans la rue », « En collectif », « Solidarité », « Mémoire et culture ») |
| `recompense` | `fragments` et/ou `boosters`, de 1 à 5 (5 fragments font un booster) |
| `plafond.par` | `jour`, `semaine` ou `toujours` (une seule fois, par exemple pour une adhésion) |
| `plafond.nombre` | combien de fois par période |

En haut du fichier, `objectifs` règle les objectifs proposés, celui par défaut, la récompense de l'objectif atteint (une fois par semaine), et si un jour de manif compte (`manifCompte`).

## Confiance et vie privée

- **Rien ne prouve qu'une action a été faite** : sans réseau ni GPS, c'est un jeu de confiance. Les plafonds empêchent d'en abuser, et les récompenses restent modestes à côté de la manif et des QR de stand.
- **Aucun historique** n'est gardé : seulement les compteurs du jour et de la semaine en cours. Un téléphone saisi ne révèle pas quelles actions ont été menées, ni quand. « Tout effacer » et le mode discret restent disponibles.
- Les **conseils** rappellent ce qui peut poser problème (par exemple, l'affichage hors des panneaux d'affichage libre est puni d'une amende).

## Le personnage, au même endroit

Le personnage se crée **une fois**, dans **Profil** › Mon personnage (nom, teint, coiffure), puis il est **enregistré tel quel**. On peut le modifier ensuite, seulement depuis le profil. Ses objets s'ajoutent tout seuls avec la collection (voir [personnage-et-batailles.md](personnage-et-batailles.md)).

## Où est le code

| Quoi | Où |
|---|---|
| Configuration | `data/actions.json` |
| Règles (plafonds, semaines, objectif, récompenses) | `paquets/noyau/src/actions.ts` (testé) |
| État du profil | `app/src/etat/profil.svelte.ts` |
| Écrans | `app/src/composants/CreationPersonnage.svelte`, `ChoixActions.svelte`, `MesActions.svelte` |
