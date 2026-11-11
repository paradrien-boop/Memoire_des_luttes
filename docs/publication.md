# Publier l'app

**Pour la phase de test**, l'app est publiée avec **GitHub Pages**, depuis un dépôt public qui ne contient que la version publiée. Une migration vers Codeberg (ou une adresse au nom du collectif) est prévue plus tard : voir en bas.

Ce dépôt-ci reste privé. À chaque envoi sur `main`, l'action « Publier » lance `npm run publier`, qui construit **le site, l'app et les packs** dans `publication/`, puis envoie ce dossier sur la branche `main` du dépôt public.

## Adresses

| Quoi | Adresse |
|---|---|
| Dépôt public | https://github.com/paradrien-boop/memoire-des-luttes-publication |
| Site | https://paradrien-boop.github.io/memoire-des-luttes-publication/ |
| **App** (à ouvrir sur le téléphone) | https://paradrien-boop.github.io/memoire-des-luttes-publication/app/ |
| Packs | https://paradrien-boop.github.io/memoire-des-luttes-publication/packs/ |

## À faire une seule fois

### 1. Activer GitHub Pages sur le dépôt public

https://github.com/paradrien-boop/memoire-des-luttes-publication/settings/pages

*Build and deployment* → *Source* : **Deploy from a branch** → *Branch* : **main**, dossier **/ (root)** → **Save**. Le site est en ligne une à deux minutes plus tard.

### 2. Le jeton qui permet à l'action d'écrire dans le dépôt public

Sans lui, la publication n'est pas mise à jour automatiquement (la première a été envoyée à la main).

1. https://github.com/settings/personal-access-tokens/new (jeton « fine-grained »).
   - *Token name* : « publication Mémoire des luttes » ; *Expiration* : à ton choix.
   - *Repository access* : **Only select repositories** → `memoire-des-luttes-publication` seulement.
   - *Permissions* → *Repository permissions* → **Contents : Read and write**. Rien d'autre.
   - *Generate token*, puis copier le jeton (il ne s'affiche qu'une fois).
2. https://github.com/paradrien-boop/Memoire_des_luttes/settings/secrets/actions → *New repository secret* → nom **`PUBLICATION_JETON`**, valeur : le jeton.

Ensuite, chaque envoi sur `main` republie tout. Sans le secret, l'action construit et vérifie tout puis s'arrête avec « Publication non envoyée » : ce n'est pas une erreur.

Le jeton ne doit **jamais** être écrit dans un fichier ni collé dans une conversation : seulement dans les *Secrets* de GitHub.

## Points d'attention

- **Anonymat** : l'adresse contient le nom du compte GitHub (`paradrien-boop`). Acceptable pour des tests entre proches ; pour le lancement public, il faudra une adresse au nom du collectif.
- **Migrer coûte cher une fois l'app adoptée** : une app installée est liée à son adresse. Si l'adresse change, il faut réinstaller, et la collection (rangée par adresse dans le téléphone) ne suit pas. Migrer **avant** d'avoir de vrais utilisateurs, ou ajouter d'abord une fonction « Exporter / importer ma collection ».
- **Sécurité** : la publication est annulée si la clé de démonstration s'y trouve, ou si un pack a une signature invalide. Sans en-têtes HTTP configurables, la politique de sécurité de l'app est écrite dans `app/index.html`.
- **Licences** : `LICENSE` et `LICENCES.md` sont publiés avec l'app.

## Migrer plus tard (Codeberg ou autre)

Un dépôt Codeberg existe déjà : https://codeberg.org/hiddink/memoire_des_luttes. L'envoi depuis GitHub y échouait en novembre 2026 (erreur 504 de Codeberg). Pour migrer :

1. Dans `.github/workflows/publier.yml`, changer `DEPOT` et l'adresse git (`codeberg.org` au lieu de `github.com`), et le nom de la branche (`pages` pour Codeberg Pages).
2. Mettre un jeton Codeberg (permission *repository : Read and write*) dans le secret correspondant.
3. Prévenir les personnes qui ont installé l'app de la nouvelle adresse.
