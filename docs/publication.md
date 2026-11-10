# Publier l'app sur Codeberg Pages

**Décision :** l'app est publiée sur **Codeberg Pages**, sous le nom **Mémoire des luttes**.

Ce dépôt GitHub reste privé. À chaque envoi sur `main`, une action GitHub lance `npm run publier`, qui construit **le site, l'app et les packs** dans `publication/`, puis envoie ce dossier vers un dépôt public sur Codeberg. Codeberg Pages le sert ensuite :

- le site à la racine : `https://<compte>.codeberg.page/<depot>/` ;
- l'app sous `/app/` : `https://<compte>.codeberg.page/<depot>/app/` (c'est l'adresse à mettre dans les QR des tracts) ;
- les packs sous `/packs/`.

Ce qui devient public : le site, l'app, les cartes et les packs. Rien d'autre : ni la documentation, ni les discussions, ni l'historique de ce dépôt. La publication est annulée si la clé de démonstration s'y trouve, ou si un pack a une signature invalide.

## À faire une seule fois

### 1. Sur Codeberg

1. **Créer un compte au nom du collectif**, pas à ton nom. Utilise une adresse email dédiée au projet.
2. **Créer un dépôt public**, par exemple `memoire-des-luttes`. Il peut rester vide : l'action GitHub le remplira.
3. **Créer un jeton d'accès** : *Settings → Applications → Generate new token*. Donne-lui seulement la permission **repository : read and write**. Copie le jeton, il ne s'affiche qu'une fois.

### 2. Sur GitHub, dans ce dépôt

*Settings → Secrets and variables → Actions* :

| Où | Nom | Valeur |
|---|---|---|
| Onglet *Secrets* | `CODEBERG_JETON` | Le jeton créé sur Codeberg |
| Onglet *Variables* | `CODEBERG_UTILISATEUR` | Le nom du compte Codeberg |
| Onglet *Variables* | `CODEBERG_DEPOT` | `compte/depot`, par exemple `memoire-des-luttes/memoire-des-luttes` |

Le jeton ne doit **jamais** être écrit dans un fichier du dépôt : seulement dans les *Secrets* de GitHub.

### 3. Lancer la première publication

Onglet *Actions* → *Publier sur Codeberg Pages* → *Run workflow*. Ensuite, chaque envoi sur `main` republie l'app.

Le site sera à l'adresse `https://<compte>.codeberg.page/<depot>/`, et l'app à `https://<compte>.codeberg.page/<depot>/app/`.

## Points d'attention

- **Licence obligatoire.** Codeberg n'accepte que des projets sous licence libre. C'est fait : le code est en AGPL-3.0, les cartes en CC BY-SA 4.0. Les fichiers `LICENSE` et `LICENCES.md` sont envoyés avec l'app.
- **Pas d'en-têtes de sécurité.** Codeberg Pages ne permet pas de les configurer. La politique de sécurité de l'app est donc écrite dans `app/index.html`, ce qui suffit pour bloquer tout chargement extérieur.
- **Anonymat.** Le compte Codeberg, l'adresse email et le jeton doivent tous être au nom du collectif. Les publications sont signées « Mémoire des luttes ».
