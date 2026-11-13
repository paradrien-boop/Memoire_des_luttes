# Le personnage et les batailles

> Statut : **première version en place** (onglet Quartier). Les dessins sont une première version, à reprendre par un·e illustrateur·rice.

## En une phrase

Ton personnage vit dans le quartier, à côté du chat. Tu l'équipes avec les objets gagnés en collectionnant chaque famille de cartes. Chaque question du quiz du jour est une **bataille cartoon contre un adversaire historique** : une bonne réponse, c'est une bataille gagnée.

## Le personnage

- Chaque personne le crée **une fois** dans **Profil** › Mon personnage : un **nom**, un **teint** (4) et une **coiffure** (courte, longue, frisée). Il est enregistré tel quel, et ne se modifie que depuis le profil. Il porte une veste de travail bleue.
- Il apparaît dans le quartier, à côté du chat. Un jour de manif validé, il lève le bras.

## L'équipement : 24 objets, 7 emplacements

Chaque famille de cartes débloque **trois objets**, à **1, 3 et 6** cartes différentes de la famille. Le personnage a **7 emplacements** ; dans **Profil › Son équipement**, on choisit quel objet débloqué mettre sur chacun (ou rien). Le choix est enregistré tout de suite. Un emplacement jamais choisi reçoit d'office le premier objet débloqué.

| Emplacement | Objets possibles (famille, cartes nécessaires) |
|---|---|
| Tête | casquette d'ouvrier (mesure, 1) · béret (courant, 3) · bonnet phrygien (événement, 6) · fichu rouge (personnalité, 6) |
| Visage | lunettes rondes (concept, 1) · binocles (livre, 6) |
| Col | foulard rouge (personnalité, 1) · lavallière (concept, 3) · écharpe (lieu, 3) · cocarde (courant, 6) |
| Haut | tablier de cantinière (personnalité, 3) · bleu de chauffe (mesure, 3) · marinière (lieu, 6) — sinon la veste de travail |
| Main droite | **porte-voix ★** (chant, 1) · drapeau rouge (courant, 1) · lanterne (lieu, 1) · journal (livre, 3) |
| Main gauche | **livre ★** (livre, 1) · pancarte (événement, 3) · tambour (chant, 6) · rose rouge (concept, 6) |
| Dos | **banderole ★** (événement, 1) · accordéon (chant, 3) · sac de tracts (mesure, 6) |

**★ Les trois objets à pouvoir ne servent que s'ils sont portés** : le porte-voix fait taire une mauvaise réponse, la banderole donne une seconde chance, le livre donne un indice. Chacun sert, par jour, autant de fois que le niveau de sa famille (1 à 3). Tous les autres objets portés rapportent **1 point de plus** par bataille gagnée. Il faut donc choisir : un pouvoir, ou des points.

La liste des objets est dans `paquets/noyau/src/equipement.ts`.

## Les adversaires

Des **types d'époque**, en caricature, **jamais des personnes réelles**. Ils sont définis par pack, dans `ennemis.json` (à côté de `pack.json`), et relus comme les cartes.

Pour la Commune de 1871 : le Versaillais, le Propriétaire, le Patron d'atelier, le Censeur, le Mouchard. Et un **chef**, le Général versaillais, qui n'apparaît qu'à la dernière bataille du jour, une fois la série « Les 72 jours » complète, et qui rapporte double.

L'adversaire d'une question dépend de la **famille de la carte** (le Censeur attaque sur les chants et les livres, le Propriétaire sur les mesures…).

```json
{
  "id": "censeur",
  "nom": "Le Censeur",
  "epoque": "XIXe siècle",
  "description": "Il interdit les journaux, les chansons et les livres qui dérangent l'ordre établi.",
  "replique": "Cette chanson est interdite !",
  "defaite": "On ne peut pas interdire ce que tout le monde chante…",
  "dessin": "censeur",
  "familles": ["chant", "livre", "courant"]
}
```

Dessins disponibles : `soldat`, `proprietaire`, `patron`, `censeur`, `mouchard`, `general`. Un chef ajoute `"chef": { "serie": "<id de la série>" }`. `npm run valider` vérifie ces fichiers.

## La bataille

1. L'adversaire lance sa réplique dans une bulle.
2. Tu peux utiliser tes pouvoirs (porte-voix, livre), puis tu réponds.
3. **Bonne réponse** : « POUF ! », l'adversaire détale en criant sa réplique de défaite. Le personnage lève le bras (avec sa banderole s'il en a une).
4. **Mauvaise réponse** : si tu as une banderole, tu peux la brandir pour une seconde chance. Sinon, « OUILLE ! », ton personnage voit des étoiles, et l'adversaire se moque.
5. Comme avant : explication, carte à lire, mémoire par carte, fragment de booster pour trois batailles gagnées.

## Le décor vit tout seul

- Pigeons, fumée de cheminée, drapeaux au vent, en continu.
- **La nuit tombe** selon l'heure réelle (de 20 h à 7 h) : étoiles, lune, fenêtres allumées.
- **Des passants** marchent sur le trottoir : un de plus par jour de manif validé (jusqu'à 6).
- Les éléments du quartier avancent avec les **batailles gagnées et les cartes possédées** de chaque famille.
- Tout s'arrête si le téléphone demande moins d'animations.

## Où est le code

| Quoi | Où |
|---|---|
| Règles des objets et des batailles | `paquets/noyau/src/equipement.ts`, `bataille.ts` (testés) |
| Adversaires de la Commune | `data/packs/officiel/commune-1871/ennemis.json` |
| Dessins | `app/src/dessins/Personnage.svelte`, `Ennemi.svelte`, `Scene.svelte` |
| Arène et panneau du personnage | `app/src/composants/Arene.svelte`, `Equipement.svelte` |
| Planche de tous les dessins | adresse `#dessins` en développement |
| **Remplacer un dessin** | déposer un fichier dans `data/dessins/` : voir [data/dessins/README.md](../data/dessins/README.md) |
