# Architecture de l'application

Ce document décrit comment construire la vraie application à partir du prototype. Il s'appuie sur des modèles de départ (*templates*) et des bibliothèques éprouvés, pour ne pas réinventer ce qui existe déjà.

## 1. Les choix techniques

| Besoin | Choix | Pourquoi |
|---|---|---|
| Base du projet | **Vite**, template officiel `svelte-ts` | Le modèle de départ le plus courant pour une app web légère. Démarrage instantané, build simple. |
| Interface | **Svelte 5** + **TypeScript** | Code court et lisible, donc facile à reprendre par des bénévoles. Application finale très légère, ce qui compte sur un vieux téléphone. |
| Hors ligne et installation | **vite-plugin-pwa** (basé sur Workbox, de Google) | La solution standard pour rendre une app web installable et utilisable sans réseau. |
| Stockage sur le téléphone | **Dexie** (au-dessus d'IndexedDB) | Base de données du navigateur, plus solide que le stockage simple du prototype, et qui supporte les images. |
| Signatures | **@noble/curves** (Ed25519) | Bibliothèque auditée, sans dépendances. La signature intégrée aux navigateurs n'est pas encore disponible partout. |
| Mise en forme canonique du JSON | **canonicalize** (norme RFC 8785) | Indispensable pour qu'une signature ne dépende pas des espaces ou de l'ordre des champs. |
| Lire un QR | **qr-scanner** | Fonctionne sur iPhone, où le lecteur de QR natif du navigateur n'existe pas. |
| Créer un QR | **qrcode** | Bibliothèque de référence. |
| Tests | **Vitest** (règles du jeu, signatures) et **Playwright** (parcours complets) | Les outils standard de l'écosystème Vite. |
| Plus tard : app installable avec Bluetooth | **Capacitor** | Il emballe la même app web dans une app Android ou iPhone, sans la réécrire. |

**Ce qu'on évite volontairement :** les services externes (statistiques, polices ou bibliothèques chargées depuis Internet, rapports d'erreurs en ligne). Tout est inclus dans l'app.

## 2. Organisation du dépôt

Le dépôt devient un ensemble de projets qui partagent un **noyau** commun (des *workspaces* npm) :

```
Memoire_des_luttes/
├── data/                 ← les cartes (inchangé, c'est ta partie)
├── docs/
├── paquets/
│   └── noyau/            ← logique partagée par l'app, l'atelier et le site
├── app/                  ← l'application (nouveau projet Vite)
├── atelier/              ← plus tard : l'outil hors ligne du collectif
├── site/                 ← plus tard : le site web
├── prototype/            ← le prototype actuel, gardé comme référence
├── scripts/              ← valider, construire, plus tard signer
└── package.json          ← déclare les workspaces
```

Le **noyau** évite d'écrire deux fois la même chose. Par exemple, la vérification d'une signature doit être exactement la même dans l'app (qui vérifie) et dans l'atelier (qui signe).

### Le noyau (`paquets/noyau/`)

```
src/
├── formats/
│   ├── carte.ts          types : Carte, Famille, Rareté, Statut
│   ├── pack.ts           types : Pack, Série
│   ├── collectif.ts      types : Délégation, Révocation
│   └── qr.ts             formats des QR (stand, événement, carte, pack)
├── validation.ts         vérifie une carte selon sa famille (remplacera scripts/valider.mjs)
├── signature.ts          canonicaliser, signer, vérifier, vérifier une chaîne de délégation
└── regles.ts             probabilités de rareté, garantie, rythme des boosters
```

### L'application (`app/`)

```
app/
├── index.html
├── vite.config.ts        configuration, dont le manifeste d'installation
├── public/
│   └── icones/
└── src/
    ├── main.ts
    ├── App.svelte        navigation et barre d'onglets
    ├── ecrans/           un fichier par écran (voir section 3)
    ├── composants/       éléments réutilisés : carte, mini-carte, booster, formulaire…
    ├── etat/             l'état en mémoire : collection, session de manif, brouillon
    ├── stockage/
    │   └── base.ts       les tables de la base locale (voir section 4)
    ├── services/
    │   ├── chrono.ts     compteur de manif
    │   ├── boosters.ts   tirage des cartes
    │   ├── packs.ts      installation et vérification des packs
    │   ├── scanner.ts    lecture des QR
    │   ├── echange.ts    échange de cartes entre téléphones
    │   └── effacement.ts « Tout effacer »
    └── styles/
        └── jetons.css    couleurs et polices (reprises du prototype)
```

## 3. Les écrans

**Barre d'onglets :** Manif · Album · Éditeur · Plus

| Écran | Contenu | Vient du prototype ? |
|---|---|---|
| **Accueil** (premier lancement) | Ce que fait l'app, ce qu'elle ne fait pas (pas de compte, pas de GPS), comment l'installer sur l'écran d'accueil | Nouveau |
| **Manif** | Compteur « Je manifeste », boosters à ouvrir, statistiques, bouton « Scanner un QR » | Oui |
| **Ouverture de booster** | Les cartes à retourner une par une | Oui |
| **Scanner** | Appareil photo pour les QR de stand, d'événement, de carte ou de pack | Nouveau (le prototype demande de taper un code) |
| **Album** | Cartes d'événement, séries, cartes perso, packs importés | Oui |
| **Carte** | La carte en grand, ses liens, et « Échanger » si on l'a en double | Oui, plus l'échange |
| **Éditeur** | Formulaire selon la famille, aperçu, mes cartes | Oui |
| **Échanger** | Montrer son QR, scanner celui de l'autre, confirmer | Nouveau |
| **Packs** | Packs installés, signature vérifiée, collectifs auxquels on fait confiance, import d'un pack | Partiellement |
| **Réglages** | Thème, mode démo, mode discret, tout effacer, à propos | Partiellement |

## 4. Les données sur le téléphone

Tables de la base locale :

| Table | Contenu |
|---|---|
| `packs` | Packs installés : contenu, signataire, résultat de la vérification |
| `possessions` | Pour chaque carte : nombre d'exemplaires, date d'obtention |
| `cartesPerso` | Cartes faites avec l'éditeur, images comprises |
| `evenements` | Cartes d'événement obtenues, avec leur numéro |
| `codesUtilises` | Codes de stand et numéros d'événement déjà utilisés |
| `jours` | Jours de manif validés |
| `confiance` | Clés des collectifs locaux acceptées par l'utilisateur |
| `reglages` | Préférences, session de manif en cours, compteur de garantie |

Rien de tout cela ne quitte le téléphone, sauf ce que l'utilisateur choisit d'exporter ou d'échanger.

## 5. Les formats de QR

Tous commencent par `MDL1:` puis un type :

| Type | Contenu | Signé ? |
|---|---|---|
| `MDL1:S:…` | Code de stand : booster spécial | Oui, par un collectif |
| `MDL1:E:…` | Carte d'événement : identifiant, numéro, date de validité | Oui, par le collectif racine |
| `MDL1:C:…` | Une carte à échanger | Non |
| `MDL1:P:…` | Un petit pack, éventuellement en plusieurs QR qui défilent | Selon le pack |

**Contrainte :** un QR contient environ 2 Ko au maximum pour rester lisible. Une carte en texte tient dans un QR, une carte avec image non. Les images circulent donc par fichier, pas par QR.

**Échange d'une carte officielle :** on n'envoie que son identifiant, puisque l'autre téléphone a déjà le pack. La carte quitte la collection de celui qui la donne. Sans réseau, on ne peut pas vérifier que la personne possédait vraiment la carte : c'est un jeu de confiance, sans valeur marchande.

## 6. Mises à jour

- **De l'app** : le *service worker* télécharge la nouvelle version en arrière-plan quand le téléphone a du réseau, et l'app propose de redémarrer.
- **Des packs** : jamais automatiquement. Un bouton « Chercher de nouveaux packs » (à la maison, avec du réseau), ou un fichier reçu de la main à la main. Chaque pack est vérifié avant installation.
- **D'où viennent-elles :** d'un hébergement public de fichiers statiques. Le dépôt étant privé, il faudra **publier** l'app et les packs ailleurs (voir [idees.md](idees.md)).

## 7. Exigences de sécurité et de vie privée

- Aucun appel réseau pendant l'utilisation. Seules exceptions : la mise à jour de l'app et le bouton « Chercher de nouveaux packs ».
- Une politique de sécurité du contenu (*CSP*) stricte, qui interdit tout chargement extérieur.
- « Tout effacer » vide la base, le cache et les réglages en un geste.
- **Mode discret** (fait) : un code d'ouverture facultatif, écran neutre et gris, reverrouillage après une minute en arrière-plan. Le nom et l'icône de l'app installée ne peuvent pas changer depuis l'app.
- L'appareil photo n'est utilisé que pendant un scan, et rien n'est enregistré.

## 8. Les étapes de construction

Chaque étape donne une app qui fonctionne et qu'on peut tester.

| Étape | Objectif | Terminée quand… |
|---|---|---|
| **0. Socle** ✅ | Workspaces, template Vite + Svelte + TypeScript, noyau vide, tests, vérification automatique sur GitHub | L'app vide se lance et les tests passent |
| **1. Parité avec le prototype** ✅ | Tous les écrans du prototype, avec la base locale et les données de `data/` | On peut faire tout ce que permet le prototype |
| **2. Hors ligne et installation** ✅ | Manifeste, *service worker*, écran d'accueil | L'app s'installe et marche en mode avion, sur Android et iPhone |
| **3. Signatures** ✅ | Signature et vérification dans le noyau, script `signer.mjs`, écran Packs | Un pack modifié d'une seule lettre est refusé |
| **4. QR** ✅ | Scanner, codes de stand et cartes d'événement signés, planches de QR à imprimer | Un QR imprimé donne la bonne carte, une seule fois |
| **5. Échange** ✅ | Échange de cartes entre deux téléphones par QR | Deux téléphones en mode avion échangent une carte |
| **6. Test en conditions réelles** | Accessibilité, batterie, mode discret, tests de parcours | Une version d'essai utilisée dans une vraie manif |
| **Plus tard** | Atelier du collectif, site, app Capacitor avec Bluetooth | — |

## 9. Questions encore ouvertes pour l'app

- ~~Où publier ?~~ Décidé : Codeberg Pages ([publication.md](publication.md)).
- ~~Le nom ?~~ Décidé : Mémoire des luttes.
- ~~La licence du code ?~~ Décidé : AGPL-3.0 ou ultérieure.
- **Le mode discret** : est-il prioritaire ?
