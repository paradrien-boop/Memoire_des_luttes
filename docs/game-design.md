# Game design : tout ce que fait l'app aujourd'hui

> Inventaire de l'app telle qu'elle est (novembre 2026), pour travailler le game design. Chaque chiffre est le vrai réglage du code, avec l'endroit où le changer. La dernière partie liste des constats et des questions à trancher.

## 1. La promesse et les contraintes

- **But** : donner envie de revenir en manif et dans l'action collective, et transmettre l'histoire des luttes au passage.
- **Contraintes non négociables** : ni compte, ni GPS, ni réseau pendant la manif. Tout reste sur le téléphone. Pas de notification, pas de culpabilisation (rater un jour ne fait rien perdre).
- **Conséquence pour le jeu** : l'app ne peut **rien vérifier** à distance. Elle fait confiance à la personne (compteur, actions déclarées), et les seules preuves sont les **QR signés** des stands et des événements.

## 2. Les boucles de jeu

```
   AGIR (manif, actions, stands)
        │  boosters
        ▼
   COLLECTIONNER (album, séries, familles)
        │  cartes possédées                 │  familles complétées
        ▼                                   ▼
   APPRENDRE (quiz = batailles)  ◄──── ÉQUIPER (objets et pouvoirs)
        │  points, fragments de booster
        ▼
   VOIR GRANDIR (chat, quartier, personnage)
```

- **Boucle principale (la rue)** : être en manif → boosters → nouvelles cartes.
- **Boucle quotidienne (le quiz)** : 3 batailles par jour sur ses propres cartes → le chat grandit, le quartier se construit, et des fragments de booster.
- **Boucle d'engagement hors manif** : actions militantes déclarées (tractage, grève, assemblée…) → fragments ou boosters, avec un objectif hebdomadaire.
- **Boucle sociale** : stands de collectifs (QR), cartes d'événement numérotées, échange de doubles entre téléphones.

## 3. Gagner des cartes

### 3.1 Le compteur de manif (onglet Agir)

| Réglage | Valeur | Où |
|---|---|---|
| Temps de manif pour un booster | **45 min** | `paquets/noyau/src/regles.ts` (`minutesParBooster`) |
| Boosters du compteur par jour, au plus | **5** | `regles.ts` (`boostersMaxParJour`) |
| Temps pour « valider » un jour de manif | **60 min** | `regles.ts` (`minutesPourValiderJour`) |
| Écart maximal compté d'un coup | 4 h (évite qu'un téléphone éteint compte des jours entiers) | `chrono.ts` (`ECART_MAX`) |

- On lance le compteur à la main en arrivant et on l'arrête en partant. Aucune localisation : c'est déclaratif.
- Un **jour de manif validé** double les points du quiz ce jour-là, met une pancarte au chat, et compte pour l'objectif de la semaine.
- La foule du quartier grandit avec le nombre de jours de manif (jusqu'à 6 passants).

### 3.2 Les boosters

| Réglage | Valeur | Où |
|---|---|---|
| Cartes par booster | **3** | `regles.ts` |
| Cartes gagnées par jour, au plus (tous boosters) | **9** (= 3 boosters) | `data/regles.json` |
| Chance par carte : légendaire / rare / base | **6 % / 26 % / 68 %** | `regles.ts` (`probabilites`) |
| Garantie anti-malchance | après **3** boosters sans rare, le suivant en contient une | `regles.ts` (`garantieApres`) |

- Les boosters au-delà de la limite du jour **ne sont pas perdus** : ils attendent le lendemain.
- Les doublons existent (ils servent à l'échange).
- Les dons de camarades et les cartes d'événement **ne comptent pas** dans la limite de 9.

### 3.3 Les stands et les QR (codes de collectifs)

- Un collectif imprime un QR de stand, **signé** avec sa clé. Le scanner donne un **booster spécial** avec une rareté minimum garantie (rare ou légendaire), gratuit.
- Si la limite du jour est atteinte, le booster spécial est **gardé pour plus tard** (section « Boosters spéciaux gardés »).
- Chaque code ne marche qu'**une fois** par téléphone.
- Exemples de démonstration : `COMMUNE-71` (légendaire garanti), `MUR-28-MAI` (rare garanti).

### 3.4 Les cartes d'événement

- Cartes **uniques et inchangeables**, créées par le collectif officiel pour un événement précis (exemple : `data/evenements/ev-18mars2027.json`).
- Obtenues en scannant le QR de l'événement. Chaque exemplaire porte un **numéro de tirage** (ex. n° 37 sur 500).
- Elles ont leur propre rayon dans l'album et ne comptent pas dans la limite du jour.

### 3.5 Les actions militantes (Profil → Mes actions)

Chaque personne **choisit les actions qu'elle se sent de mener**, et se fixe un **objectif par semaine** (1, 2, 3, 5 ou 7 actions ; 2 par défaut). Atteindre l'objectif rapporte **1 booster**. Une manif validée compte comme une action.

| Action | Catégorie | Récompense | Plafond |
|---|---|---|---|
| Distribuer des tracts | Dans la rue | 2 fragments | 1 / jour |
| Coller des affiches (panneaux libres) | Dans la rue | 1 fragment | 1 / jour |
| Soutenir un piquet de grève | Dans la rue | 1 booster | 2 / semaine |
| Faire grève | En collectif | 1 booster | 1 / jour |
| Participer à une assemblée | En collectif | 2 fragments | 2 / semaine |
| Rejoindre une organisation | En collectif | 2 boosters | 1 pour toujours |
| Donner à une caisse de grève | Solidarité | 1 booster | 1 / semaine |
| Aider une action de solidarité | Solidarité | 2 fragments | 2 / semaine |
| Lire un texte de lutte | Mémoire et culture | 1 fragment | 2 / semaine |
| Raconter une histoire de lutte | Mémoire et culture | 1 fragment | 1 / jour |
| Aller à une commémoration | Mémoire et culture | 1 booster | 1 / semaine |

- Tout se règle dans `data/actions.json` (actions, catégories, récompenses, plafonds, objectifs).
- **5 fragments = 1 booster** (`mascotte.ts`, `FRAGMENTS_PAR_BOOSTER`).
- Aucun historique n'est gardé : seulement les compteurs du jour et de la semaine (protection en cas de saisie du téléphone).

### 3.6 L'échange de doubles

- Une carte en **double** peut être donnée : le téléphone qui donne affiche un QR, l'autre le scanne. Ça marche en mode avion.
- Rien n'est retiré tant que le don n'est pas confirmé.

## 4. Collectionner (onglet Album)

### 4.1 Les familles de cartes

9 familles, chacune avec ses propres rubriques (`data/familles/familles.json`) :

| Famille | Rubriques particulières | Construit dans le quartier |
|---|---|---|
| Personnalité | rôle | la fresque murale |
| Événement | lieu, bilan | les banderoles et la barricade |
| Lieu | adresse | la plaque et le monument |
| Mesure, loi | qui, état actuel | la Bourse du travail |
| Concept | exemple | l'atelier coopératif |
| Courant de pensée | figures | le mur d'affiches |
| Livre | auteur | la bibliothèque populaire |
| Chant | auteur | le kiosque à musique |
| Manif (cartes d'événement seulement) | organisations | — |

Toutes ont : titre, dates, « ce qui s'est passé », « pourquoi c'est important », une phrase et sa source, « pour aller plus loin », et des **sources** obligatoires.

### 4.2 Les raretés

**Base**, **rare**, **légendaire**, plus **événement** (cartes numérotées).

### 4.3 Les séries

Dans un pack, les cartes sont regroupées en **séries**. Compléter une série donne un accessoire au chat, et peut faire apparaître un **chef** adversaire.

| Série (pack Commune 1871) | Cartes | Récompense |
|---|---|---|
| Les 72 jours | 7 | cocarde du chat + le Général versaillais (chef) |
| Communard·es | 5 | foulard du chat |
| Chants & idées | 4 | partition du chat |

### 4.4 Autres vues de l'album

- **Frise chronologique** de toutes les cartes possédées.
- **Carte des idées** : les liens entre cartes, sous forme de réseau.
- Rayon des **cartes d'événement**.

### 4.5 Le contenu actuel

Un seul pack officiel : **la Commune de Paris (1871), 16 cartes** (7 base, 7 rares, 2 légendaires) :
personnalité 5, événement 3, mesure 3, chant 2, livre 1, courant 1, lieu 1, **concept 0**.

## 5. Apprendre en combattant (onglet Quartier)

### 5.1 Le quiz du jour = 3 batailles

| Réglage | Valeur | Où |
|---|---|---|
| Questions par jour | **3** | `quiz.ts` (`QUESTIONS_PAR_JOUR`) |
| Cartes nécessaires pour débloquer le quiz | **4** | `quiz.ts` (`CARTES_MIN_QUIZ`) |
| Révision espacée (jours avant de revoir une carte) | 0, 1, 2, 4, 8, 16 | `quiz.ts` (`INTERVALLES`) |

- Les questions portent **uniquement sur les cartes possédées**. Elles sont fixées pour la journée.
- Deux sources : questions **écrites** dans les cartes (prioritaires), et questions **fabriquées** automatiquement (quelle année, qui l'a dit, quelle carte, quel rôle, quel lien).
- Après chaque réponse, la carte et l'explication s'affichent : le but est d'apprendre.

### 5.2 Les adversaires historiques

Chaque question oppose le personnage à un adversaire d'époque, choisi selon la **famille de la carte**. Combat cartoon : victoire, l'adversaire détale (« POUF ! ») ; défaite, le personnage voit des étoiles (« OUILLE ! »).

| Adversaire | Attaque sur |
|---|---|
| Le Versaillais (soldat) | événement, lieu |
| Le Propriétaire | mesure |
| Le Patron d'atelier | concept, mesure |
| Le Censeur | chant, livre, courant |
| Le Mouchard | personnalité |
| **Le Général versaillais** (chef) | dernière question du jour, seulement si la série « Les 72 jours » est complète. Points doublés. |

Les adversaires se définissent par pack (`ennemis.json`) : réplique, cri de défaite, dessin, familles. Jamais une personne vivante.

### 5.3 Points et récompenses

| Gain | Valeur |
|---|---|
| Bataille gagnée | **10 points** (+1 par objet porté sans pouvoir) |
| Jour de manif validé | points ×2 |
| Contre un chef | points ×2 |
| Les 3 batailles du jour gagnées | **1 fragment** de booster |
| Bataille gagnée | +1 étape de construction pour la famille de la carte dans le quartier |

## 6. Le chat et le quartier

### 6.1 Le chat

Chaque personne **nomme son chat**. Il grandit avec les points :

| Stade | Points |
|---|---|
| Chaton des rues | 0 |
| Chat de gouttière | 30 |
| Chat de grève | 100 |
| Chat de barricade | 250 |
| Chat sauvage | 500 |

- Il **s'endort** si on n'est pas venu depuis plus de 2 jours, et se réveille au retour **sans rien perdre**.
- Accessoires gagnés par les séries (cocarde, foulard, partition), pancarte les jours de manif.

### 6.2 Le quartier

- 8 éléments (un par famille), chacun en 3 niveaux : **esquissé** (1 bonne réponse), **construit** (4), **animé** (10). Réglé dans `mascotte.ts` (`PALIERS`).
- Le quartier vit tout seul : passants, pigeons, fumée, fenêtres qui s'allument, **nuit** de 20 h à 7 h (heure réelle).
- Une description en texte accompagne la scène (accessibilité).

## 7. Le personnage et son équipement (Profil)

### 7.1 Création

Créé **une seule fois** et sauvegardé : nom, teint (4 choix), coiffure (courte, longue, frisée). Il apparaît dans le quartier et dans les batailles.

### 7.2 Les objets

- **24 objets**, 3 par famille (sauf manif). Ils se débloquent avec le nombre de **cartes différentes** d'une famille : **1, 3 et 6** cartes (`equipement.ts`, `PALIERS_OBJET`).
- **7 emplacements** : tête, visage, col, haut, main droite, main gauche, dos. On choisit **quel objet débloqué porter** sur chaque emplacement.

| Famille | 1 carte | 3 cartes | 6 cartes |
|---|---|---|---|
| Chant | porte-voix (main droite) ★ | accordéon (dos) | tambour (main gauche) |
| Événement | banderole (dos) ★ | pancarte (main gauche) | bonnet phrygien (tête) |
| Livre | livre (main gauche) ★ | journal (main droite) | binocles (visage) |
| Personnalité | foulard rouge (col) | tablier de cantinière (haut) | fichu rouge (tête) |
| Mesure | casquette d'ouvrier (tête) | bleu de chauffe (haut) | sac de tracts (dos) |
| Concept | lunettes rondes (visage) | lavallière (col) | rose rouge (main gauche) |
| Courant | drapeau rouge (main droite) | béret (tête) | cocarde (col) |
| Lieu | lanterne (main droite) | écharpe (col) | marinière (haut) |

★ = objet à **pouvoir**, utilisable pendant les batailles :

| Pouvoir | Objet | Effet |
|---|---|---|
| Faire taire | porte-voix | retire une mauvaise réponse |
| Seconde chance | banderole | une deuxième tentative après une erreur |
| Indice | livre | montre la famille et les dates de la carte |

- Utilisations par jour = **niveau de la famille** (1 à 3 selon le nombre de cartes de cette famille).
- Les autres objets portés donnent **+1 point** par bataille gagnée.

## 8. Créer et partager des cartes (onglet Éditeur)

- Formulaire **différent selon la famille**, avec image facultative.
- Les cartes créées restent sur le téléphone (origine « perso »), et peuvent être **exportées en pack** pour être proposées au collectif.
- **Import de packs** : packs officiels (signés par la clé racine), packs locaux (signés par un collectif délégué), ou packs non signés (marqués comme tels).
- Circuit d'une carte officielle : proposée → à relire (deux relectures, sources vérifiées) → validée → signée.

## 9. Confiance, sécurité et vie privée

- **Signatures** : packs officiels, collectifs délégués (avec droits et date d'expiration), révocations. Un pack modifié d'une seule lettre est refusé.
- **Mode discret** : code d'ouverture, l'app peut se cacher derrière un écran neutre.
- **Tout effacer** en un geste.
- **Aucun historique** d'actions, aucune donnée envoyée, aucune requête externe pendant l'usage.
- **Mises à jour** : l'app propose la nouvelle version, elle ne s'impose pas. Nouveaux packs cherchés seulement sur demande.

## 10. Supports

- **App web installable** (fonctionne en mode avion), **APK Android**.
- **Site** : installation, cartes et leur état, packs, collectifs et leurs clés, participation et débat.
- **Atelier de dessin** pour remplacer les dessins et voir le rendu.

## 11. Une journée type, en chiffres

Quelqu'un qui manifeste 3 h, déclare un tractage et gagne ses 3 batailles :

- Compteur : 3 h = 4 boosters, mais la limite de **9 cartes** en laisse ouvrir **3** aujourd'hui (le 4e attend demain).
- Tractage : 2 fragments. Quiz parfait : 1 fragment, et 60 points (jour de manif = ×2).
- Fin de journée : 9 cartes, 3 fragments sur 5, le chat passe probablement au stade 2.

Quelqu'un qui ne vient jamais en manif mais fait le quiz tous les jours et déclare ses actions :
environ 1 fragment par jour par le quiz, plus le booster de l'objectif hebdomadaire, plus les actions. **En cochant toutes les actions au maximum, on monte à environ 18 boosters par semaine** (dont 7 rien qu'avec « Faire grève », plafonnée à 1 par jour), soit presque la limite de 9 cartes chaque jour.

## 12. Constats et questions pour le game design

### Constats sur l'équilibre actuel

1. **Contenu trop petit pour la mécanique** : 16 cartes, alors qu'un jour de manif en donne 9. La collection est quasi complète en 2 ou 3 manifs, et les doublons arrivent très vite.
2. **Familles déséquilibrées** : aucune carte « concept », une seule « lieu », « livre » et « courant ». Les objets à 3 et 6 cartes de ces familles sont **impossibles à obtenir** aujourd'hui, et le Patron d'atelier attaque surtout sur une famille vide.
3. **Le quiz s'épuise** avec peu de cartes : la révision espacée fait revenir les mêmes cartes souvent.
4. **Les actions dépassent la rue** : en cochant tout, une semaine sans manif rapporte environ 18 boosters, plus que 3 jours de manif. Seule la limite de 9 cartes par jour freine. À revoir pour garder « la rue reste la principale source » (plafond par semaine pour la grève ? plafond global des actions ?).
5. **Les doublons n'ont qu'un usage** (l'échange). Pas de recyclage.
6. **Pas de fin de partie ni de prestige** une fois le chat au stade 5 (500 points ≈ 50 batailles gagnées, soit 2 à 3 semaines de quiz).
7. **Les pouvoirs** se limitent à 3 objets ; les 21 autres ne font que +1 point.

### Questions à trancher

- **Rythme** : combien de manifs pour compléter un pack ? (aujourd'hui 2 à 3, peut-être trop rapide)
- **Doublons** : les recycler en fragments ? les rendre utiles pour débloquer quelque chose ?
- **Déclaratif** : quel garde-fou contre la triche, sans surveillance ? (plafonds actuels, ou pas de garde-fou du tout, puisqu'on ne joue contre personne ?)
- **Après le stade 5** : nouvelle saison, nouveau quartier par pack, prestige ?
- **Collectif** : un objectif commun à plusieurs (le cortège d'un collectif construit un quartier commun via les QR de stand) ?
- **Plus de pouvoirs** : un pouvoir par famille ? des combinaisons (tenue complète d'une famille = bonus) ?
- **Chefs** : un chef par série plutôt qu'un seul ?
- **Cartes d'événement** : un effet en jeu (objet spécial, accessoire unique) en plus de la collection ?

## Où changer quoi

| Pour changer… | Fichier |
|---|---|
| Limite de cartes par jour | `data/regles.json` |
| Actions militantes, récompenses, plafonds, objectifs | `data/actions.json` |
| Cartes, séries | `data/packs/<type>/<pack>/` |
| Adversaires | `data/packs/<type>/<pack>/ennemis.json` |
| Familles et leurs rubriques | `data/familles/familles.json` |
| Durée pour un booster, probabilités, garantie | `paquets/noyau/src/regles.ts` |
| Questions par jour, révision espacée | `paquets/noyau/src/quiz.ts` |
| Stades du chat, niveaux du quartier, points, fragments | `paquets/noyau/src/mascotte.ts` |
| Objets, paliers, pouvoirs | `paquets/noyau/src/equipement.ts` |
| Dessins | `data/dessins/` (voir l'atelier de dessin) |

Les fichiers de `data/` peuvent être modifiés sans toucher au code, et `npm run valider` vérifie qu'ils sont corrects. Ceux de `paquets/noyau/` sont du code : il vaut mieux me demander.
