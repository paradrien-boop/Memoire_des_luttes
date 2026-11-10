# Publier l'app sur Codeberg Pages

**Décision :** l'app est publiée sur **Codeberg Pages**, sous le nom **Mémoire des luttes**.

Ce dépôt GitHub reste privé. À chaque envoi sur `main`, une action GitHub lance `npm run publier`, qui construit **le site, l'app et les packs** dans `publication/`, puis envoie ce dossier vers un dépôt public sur Codeberg. Codeberg Pages le sert ensuite :

- le site à la racine : `https://<compte>.codeberg.page/<depot>/` ;
- l'app sous `/app/` : `https://<compte>.codeberg.page/<depot>/app/` (c'est l'adresse à mettre dans les QR des tracts) ;
- les packs sous `/packs/`.

Ce qui devient public : le site, l'app, les cartes et les packs. Rien d'autre : ni la documentation, ni les discussions, ni l'historique de ce dépôt. La publication est annulée si la clé de démonstration s'y trouve, ou si un pack a une signature invalide.

## Adresses

| Quoi | Adresse |
|---|---|
| Dépôt public (Codeberg) | https://codeberg.org/hiddink/memoire_des_luttes (branche `pages`, écrite par l'action GitHub) |
| Site | https://hiddink.codeberg.page/memoire_des_luttes/ |
| **App** (à mettre dans les QR des tracts) | https://hiddink.codeberg.page/memoire_des_luttes/app/ |
| Packs | https://hiddink.codeberg.page/memoire_des_luttes/packs/ |

Le compte et le dépôt sont écrits dans `.github/workflows/publier.yml` (ce ne sont pas des secrets). Des variables GitHub `CODEBERG_UTILISATEUR` et `CODEBERG_DEPOT` peuvent les remplacer.

## Il reste une seule chose à faire : le jeton

1. **Sur Codeberg**, connecté au compte `hiddink` : *Settings → Applications → Generate New Token*. Nom : par exemple « publication GitHub ». Permission : **repository : Read and write**, rien d'autre. Copier le jeton, il ne s'affiche qu'une fois.
2. **Sur GitHub**, dans ce dépôt : *Settings → Secrets and variables → Actions → New repository secret*. Nom : `CODEBERG_JETON`, valeur : le jeton.
3. Onglet *Actions* → *Publier sur Codeberg Pages* → *Run workflow*. Ensuite, chaque envoi sur `main` republie tout.

Tant que le secret n'existe pas, l'action construit et vérifie tout, puis s'arrête avec le message « Publication non envoyée » : ce n'est pas une erreur.

Le jeton ne doit **jamais** être écrit dans un fichier du dépôt, ni collé dans une conversation : seulement dans les *Secrets* de GitHub.

## Points d'attention

- **Licence obligatoire.** Codeberg n'accepte que des projets sous licence libre. C'est fait : le code est en AGPL-3.0, les cartes en CC BY-SA 4.0. Les fichiers `LICENSE` et `LICENCES.md` sont envoyés avec l'app.
- **Pas d'en-têtes de sécurité.** Codeberg Pages ne permet pas de les configurer. La politique de sécurité de l'app est donc écrite dans `app/index.html`, ce qui suffit pour bloquer tout chargement extérieur.
- **Anonymat.** Le compte Codeberg, l'adresse email et le jeton doivent tous être au nom du collectif. Les publications sont signées « Mémoire des luttes ».
