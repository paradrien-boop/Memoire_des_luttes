# Le site web (à construire)

L'application reste sans compte et hors ligne. Le site sert à celles et ceux qui **fabriquent** le contenu. Il lit ses données dans ce dépôt.

## Les quatre espaces

### 1. Installer
- Un QR et un lien pour installer l'application, avec un guide.
- Les packs à télécharger.
- L'empreinte de la clé racine, pour que chacun puisse vérifier les packs. Elle doit être publiée à plusieurs endroits.

### 2. Débattre des cartes
- Une page de discussion par carte, publiée ou seulement proposée.
- Proposer des corrections, apporter des sources, contester une formulation.
- Le statut de la carte est visible : proposée, à relire, validée, signée.
- Outils libres existants à étudier : **Decidim** (démocratie participative) ou **Discourse** (forum).
- En attendant, les débats se font dans les *issues* de ce dépôt (voir [CONTRIBUER.md](../CONTRIBUER.md)).

### 3. Gérer les clés
- Un collectif crée sa clé chez lui. Le site ne reçoit que la partie publique.
- Le site publie la liste des clés valides et des clés révoquées.
- Il ne stocke **jamais** de clé secrète.

### 4. Faire connaître les collectifs
- Un annuaire : nom, présentation, thèmes, packs publiés.
- Entrée par parrainage de deux collectifs déjà reconnus (règle à confirmer).
- Apparaître dans l'annuaire est un choix : une clé peut être valide sans être affichée.

## Points de vigilance

- **Point central** : aucun journal d'adresses IP, un accès par Tor, et l'application doit continuer à fonctionner si le site est fermé.
- **Comptes** : nécessaires pour débattre, mais sous pseudonyme, et seulement pour les contributeurs.
- **Modération** : héberger des commentaires engage une responsabilité juridique. Il faudra des règles de débat et des modérateurs.

## Lien avec ce dépôt

Le site et l'application liront les données publiées depuis ce dépôt :
- `data/packs/` pour les packs ;
- `data/collectifs/` pour les clés et l'annuaire ;
- `data/evenements/` pour les cartes d'événement.

⚠️ **Le dépôt est privé.** L'application et le site ne pourront pas lire un dépôt privé sans clé d'accès, et une clé d'accès ne doit jamais être mise dans l'application. Il faudra donc **publier** les données : un dépôt public miroir, des *releases* publiques ou un hébergement de fichiers statiques. Voir [les idées en attente](idees.md).
