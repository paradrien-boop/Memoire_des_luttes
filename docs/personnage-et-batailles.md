# Le personnage et les batailles

> Statut : **première version en place** (onglet Quartier). Les dessins sont une première version, à reprendre par un·e illustrateur·rice.

## En une phrase

Ton personnage vit dans le quartier, à côté du chat. Tu l'équipes avec les objets gagnés en collectionnant chaque famille de cartes. Chaque question du quiz du jour est une **bataille cartoon contre un adversaire historique** : une bonne réponse, c'est une bataille gagnée.

## Le personnage

- Chaque personne choisit son **teint** (4) et sa **coiffure** (courte, longue, frisée). Il porte une veste de travail bleue.
- Il apparaît dans le quartier, à côté du chat. Un jour de manif validé, il lève le bras.

## Les objets : un par famille de cartes

On gagne l'objet d'une famille **dès la première carte** de cette famille. Il s'améliore à **3** puis **6** cartes différentes, et son dessin change sur le personnage.

| Famille | Objet | Pendant la bataille |
|---|---|---|
| Chant | le porte-voix | **Fait taire une mauvaise réponse** (elle disparaît) |
| Événement | la banderole | **Seconde chance** : après une erreur, la bataille reprend |
| Livre | le livre | **Indice** : la famille et les dates de la carte (jamais la réponse d'une question de date) |
| Personnalité | le foulard rouge | des points en plus à chaque bataille gagnée |
| Mesure, loi | la casquette d'ouvrier | des points en plus |
| Concept | les lunettes | des points en plus |
| Courant de pensée | le drapeau | des points en plus |
| Lieu | la lanterne | des points en plus |

Un pouvoir s'utilise **une fois par jour et par niveau** de l'objet. Les objets sans pouvoir ajoutent 1 point par niveau à chaque bataille gagnée.

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
