# Quiz du jour et mascotte (conception)

> Le quiz est devenu une suite de **batailles** contre des adversaires historiques, avec un personnage à équiper : voir [personnage-et-batailles.md](personnage-et-batailles.md).

> Statut : **première version en place** (onglet Quartier). Les dessins sont une première version, à reprendre par un·e illustrateur·rice. Le nom du chat est choisi par chaque personne.

## En une phrase

Chaque jour, trois questions sur **les cartes que tu possèdes**. Les bonnes réponses font grandir une mascotte, le **chat noir**, et transforment son **quartier** selon ce que tu as appris.

## 1. Le quiz du jour

### Principe

- **3 questions par jour**, uniquement sur des cartes déjà dans ton album. On n'est jamais interrogé sur ce qu'on n'a pas encore pu lire.
- Il est disponible dès qu'on possède **au moins 4 cartes**, car il faut des cartes pour fabriquer les mauvaises réponses.
- Tout fonctionne **hors ligne** : les questions sont fabriquées sur le téléphone à partir du contenu des cartes.
- Après chaque réponse, juste ou fausse, l'app montre **la carte concernée** et une courte explication. Le but est d'apprendre, pas de piéger.

### D'où viennent les questions

**a) Des questions écrites par l'équipe éditoriale** (prioritaires, car plus riches). Elles sont ajoutées dans le fichier de la carte :

```json
"questions": [
  {
    "q": "Pourquoi les soldats refusent-ils de tirer le 18 mars 1871 ?",
    "bonne": "Ils fraternisent avec la foule qui entoure les canons",
    "fausses": ["Ils n'ont plus de munitions", "Thiers leur en donne l'ordre", "Il pleut trop"],
    "explication": "Les femmes de Montmartre donnent l'alerte, la foule entoure la troupe, qui met la crosse en l'air."
  }
]
```

**b) Des questions fabriquées automatiquement** à partir des rubriques des cartes, quand il n'y a pas assez de questions écrites :

| Type | Exemple | Rubriques utilisées |
|---|---|---|
| Quelle année ? | « En quelle année est fondée la Commune de Paris ? » | `dates` (les mauvaises réponses viennent d'autres cartes, ou de l'année à ±3 ans) |
| Qui l'a dit ? | « Qui a dit : *Le pouvoir est maudit…* ? » | `phrase` et `phraseSrc` |
| Quelle carte ? | Le texte de « Ce qui s'est passé », avec le titre masqué : « De quoi s'agit-il ? » | `fait` et `title` (les choix viennent de la même famille) |
| Quel rôle ? | « Quel était le métier d'Eugène Varlin ? » | `role` |
| Quel lien ? | « Quelle carte est liée à Louise Michel ? » | `links` |

Une question fabriquée n'est utilisée que si elle est **sans ambiguïté** : le titre ne doit pas apparaître dans le texte montré, et les mauvaises réponses doivent être différentes de la bonne.

### Choisir les questions du jour

- Une **petite mémoire par carte**, sur le principe des boîtes de Leitner : une carte ratée revient vite, une carte réussie plusieurs fois revient de plus en plus rarement.
- Les questions du jour sont fixées pour la journée : fermer et rouvrir l'app ne change pas les questions.

### Pas de culpabilité

- Rater un jour **ne fait rien perdre**. La mascotte s'endort, puis se réveille quand on revient.
- Le compteur de jours tolère un jour de repos par semaine.
- Il n'y a ni notification ni rappel insistant : l'app ne cherche pas à rendre accro.

## 2. La mascotte : le chat noir

Le **chat noir hérissé** est un vieux symbole du mouvement ouvrier : celui de la grève sauvage et du sabotage. Notre chat sera **dessiné spécialement pour l'app**, dans le style des cartes (affiche risographe, rouge et noir).

**Chaque personne donne son propre nom à son chat**, au premier passage dans l'onglet Quartier. On peut le renommer ensuite.

### Ses stades

Les bonnes réponses donnent des **points de mémoire**. Le chat grandit par paliers :

| Stade | Points | Apparence |
|---|---|---|
| 1. Chaton des rues | 0 | Petit, maigre, oreilles basses |
| 2. Chat de gouttière | 30 | Plus assuré, se promène sur les toits |
| 3. Chat de grève | 100 | Poil hérissé, regard décidé |
| 4. Chat de barricade | 250 | Porte une écharpe rouge |
| 5. Chat sauvage | 500 | La silhouette d'affiche, dos rond, toutes griffes dehors |

**Ses accessoires** se gagnent en complétant les séries de l'album, et pas avec le quiz. Par exemple, la série « Les 72 jours » donne la cocarde rouge, et « Chants & idées » donne un petit accordéon.

## 3. Le quartier : l'environnement qui se transforme

Le chat vit dans une **rue**, grise et vide au départ. **Chaque bonne réponse construit quelque chose, selon la famille de la carte concernée.** Le quartier montre donc ce que tu as appris :

| Famille de la carte | Ce qui apparaît dans le quartier |
|---|---|
| Personnalité | Des portraits sur une fresque murale |
| Événement | Des banderoles, puis une barricade, puis un cortège |
| Lieu | Une plaque commémorative, un monument |
| Mesure, loi | La Bourse du travail, une boulangerie ouverte de jour |
| Concept | Un atelier coopératif |
| Courant de pensée | Un local associatif avec des affiches |
| Livre | Une bibliothèque populaire, des bouquinistes |
| Chant | Un kiosque à musique, une chorale |

Chaque élément a **trois niveaux** : il est esquissé, puis construit, puis animé (des gens, de la lumière aux fenêtres). Le quartier se peuple au fil des réponses, pour rappeler que les luttes sont **collectives**.

**Lien avec les manifs :** un jour de manif validé, le chat apparaît dans un cortège avec une pancarte, et le quiz de ce jour-là rapporte le double de points.

## 4. Ce que ça rapporte, sans casser le jeu

| Action | Gain |
|---|---|
| Bonne réponse | 10 points de mémoire, plus une étape de construction dans le quartier |
| Les 3 bonnes réponses du jour | Un **fragment de booster**. 5 fragments font un booster. |
| Jour de manif validé | Points du quiz doublés ce jour-là |

Le quiz rapporte donc au maximum un booster par semaine environ. **La rue reste la principale source de boosters**, ce qui est le cœur du projet.

## 5. Côté technique

- **Noyau** (`paquets/noyau/`) : fabrication des questions, choix du jour, mémoire par carte, calcul des points et des stades. Ce sont des fonctions pures, testées comme le reste.
- **Données sur le téléphone** : de nouvelles tables pour le quiz du jour, la mémoire par carte et l'état du chat et du quartier.
- **Dessins** : la scène est faite de **calques SVG** superposés (rue, bâtiments, personnages, chat). Débloquer un élément affiche simplement un calque. Il faut un ou une **illustratrice** pour le style final. On peut commencer avec des formes simples.
- **Accessibilité** : la scène a une description en texte, par exemple « Ton quartier : une bibliothèque, un kiosque à musique, une barricade ».
- **Nouvel onglet « Quartier »**, entre Album et Éditeur.
- **Validation** : `scripts/valider.mjs` vérifiera aussi les questions écrites (une bonne réponse, trois mauvaises, une explication).

## 6. Étapes de construction proposées

1. Quiz avec questions fabriquées automatiquement et mémoire par carte (noyau et écran).
2. Questions écrites dans les fichiers des cartes, et leur validation.
3. Mascotte et quartier avec des formes simples, puis les vraies illustrations.
4. Fragments de booster et bonus des jours de manif.

## Où en est-on

| Étape | État |
|---|---|
| 1. Quiz, questions fabriquées, mémoire par carte | ✅ `paquets/noyau/src/quiz.ts`, testé |
| 2. Questions écrites dans les cartes | ✅ lues par l'app et vérifiées par `npm run valider` ; reste à en écrire |
| 3. Mascotte et quartier | ✅ première version des dessins (`app/src/dessins/`) |
| 4. Fragments de booster et bonus des jours de manif | ✅ |

**Pour les dessins** : en développement, l'adresse `#dessins` affiche une planche avec tous les stades du chat et tous les niveaux du quartier. C'est la page à montrer à un·e illustrateur·rice. Les dessins sont en SVG : chaque élément du quartier est un bloc séparé dans `Scene.svelte`, et le chat est dans `Chat.svelte`.

## Questions ouvertes

- Qui pourrait **reprendre les dessins** dans un style définitif ?
