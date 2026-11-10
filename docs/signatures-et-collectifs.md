# Signatures, collectifs et confiance

Il n'y a aucun serveur de confiance. Tout repose sur des **clés de signature** que chaque téléphone vérifie seul, hors ligne.

## Les niveaux de confiance

| Niveau | Badge | Qui signe | Dans les boosters ? |
|---|---|---|---|
| Officiel | ✊ doré | Le collectif, avec la clé racine | Oui |
| Local | ✊ argent | Un collectif local, avec une clé déléguée | Oui, si l'utilisateur choisit de lui faire confiance |
| Perso | aucun | Personne | Non, seulement dans l'album |
| Événement | 🔒 | Le collectif, pour une seule date | Non, seulement sur place |

## La clé racine

- La partie publique est intégrée à l'application.
- La partie secrète reste sur un ordinateur **jamais connecté à Internet**, avec une copie de secours sur papier.
- Deux personnes au maximum y ont accès.

## Les clés des collectifs locaux

1. Le collectif crée sa clé **sur son propre ordinateur**. La partie secrète ne quitte jamais cet ordinateur.
2. Il envoie la partie publique, avec une présentation.
3. Il est parrainé (règle proposée : deux collectifs déjà reconnus).
4. Le collectif racine signe une **délégation** hors ligne. Elle précise :
   - le nom affiché ;
   - la date d'expiration (1 an, par exemple) ;
   - les droits : par exemple cartes Base et Rare, mais pas Légendaire ni Événement.
5. La délégation est publiée dans [`data/collectifs/`](../data/collectifs/) et intégrée au pack officiel suivant.

Le téléphone vérifie toute la chaîne : collectif racine, puis collectif local, puis carte.

**Révocation** : la clé d'un collectif qui pose problème est ajoutée à une liste de révocation, publiée avec le pack officiel suivant. Ses cartes perdent leur badge.

## Pourquoi une carte signée ne peut pas être modifiée

La signature porte sur le contenu exact du pack. Si une seule lettre change, la signature ne correspond plus et la carte perd son sceau.

## Les cartes d'événement

- Le collectif crée la carte et l'imprime sur un nombre limité de QR (500, par exemple), chacun avec son propre numéro signé.
- Le QR n'est accepté que le jour de l'événement, d'après la date du téléphone.
- Chaque numéro ne fonctionne qu'une fois par téléphone.

**Limite connue** : sans réseau, on ne peut pas empêcher deux téléphones de scanner la photo d'un même QR, ni empêcher quelqu'un de changer la date du téléphone. La rareté repose donc sur la confiance et la présence physique. Les cartes n'ayant aucune valeur marchande, c'est acceptable. Une balise Bluetooth sur le stand réduirait ce problème (voir [bluetooth.md](bluetooth.md)).

## Le circuit d'une carte officielle

1. **Proposition** : n'importe qui fait la carte dans l'éditeur et l'envoie, de façon anonyme.
2. **Relecture** : deux personnes vérifient les faits et les sources.
3. **Signature** : faite hors ligne par la personne qui garde la clé.
4. **Diffusion** : le pack signé circule, et chaque téléphone vérifie la signature.

## L'atelier du collectif

Un outil en ligne de commande, à utiliser sur l'ordinateur **jamais connecté à Internet** (`npm run atelier -- aide` pour l'aide complète) :

```bash
npm run atelier -- cles --sortie /cle-usb/racine.cle-secrete.json
```

```bash
npm run atelier -- signer-pack --pack data/packs/officiel/commune-1871 --cle /cle-usb/racine.cle-secrete.json --ecrire --sortie commune-1871.pack.json
```

```bash
npm run atelier -- deleguer --cle /cle-usb/racine.cle-secrete.json --collectif cgt-douarnenez --nom "CGT Douarnenez" --publique <clé publique du collectif> --droits base,rare --expire 2027-12-31 --sortie delegation.json
```

```bash
npm run atelier -- qr-evenement --cle /cle-usb/racine.cle-secrete.json --evenement ev-18mars2027 --du 2027-03-18 --au 2027-03-18 --sortie planche.html
```

| Commande | Rôle |
|---|---|
| `cles` | Crée une paire de clés. Refuse d'écrire une clé secrète dans le dépôt. |
| `empreinte` | Affiche l'empreinte d'une clé, à comparer à l'œil. |
| `deleguer` | Délivre une délégation à un collectif local (droits, date d'expiration). |
| `signer-pack` | Signe un pack. `--ecrire` met la signature dans `pack.json`, `--sortie` écrit le pack prêt à diffuser. |
| `verifier` | Vérifie la signature d'un pack. |
| `qr-stand` | Planche de QR de stand à imprimer (booster spécial, une fois par téléphone). |
| `qr-evenement` | Planche de QR numérotés d'une carte d'événement. La carte voyage dans le QR : on l'obtient même sans avoir mis ses packs à jour. |

Une carte modifiée après la signature est signalée par `npm run valider` : il faut re-signer le pack.

## Dans l'app

- **Plus › Packs** montre l'empreinte de la clé du collectif, les packs installés et leur statut, et permet d'installer un pack.
- Un pack **officiel** signé est installé tout de suite : ses cartes tombent dans les boosters.
- Un pack **local** reste en attente jusqu'à ce que l'utilisateur fasse confiance au collectif. Ses QR de stand ne sont acceptés qu'ensuite.
- Les packs installés sont revérifiés à chaque ouverture : une clé révoquée ou une délégation expirée les rend inutilisables.
- La **clé de démonstration** (`data/cles/demo.json`) n'est acceptée qu'en développement, dans la page de démo et dans les tests. La vérification automatique échoue si elle se retrouve dans l'app publiée.

## Choix techniques envisagés

- Signatures **Ed25519** : courtes, rapides, disponibles dans les navigateurs récents et dans toutes les bibliothèques courantes.
- Le pack est signé dans son ensemble, après une mise en forme canonique du JSON (sinon un simple changement d'espaces casserait la signature).
