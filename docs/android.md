# L'application Android

La même app, emballée par **Capacitor** dans une vraie application Android (un fichier APK), installée sans passer par le navigateur ni par le Play Store. Le code est le même que celui de l'app web : seules quelques différences sont réglées à la construction (`MDL_ANDROID=1`).

## Où la trouver

- **Sur le site** : https://paradrien-boop.github.io/memoire-des-luttes-publication/ → « Ou l'application Android à installer ». Le fichier est `telecharger/memoire-des-luttes.apk`.
- **Sur GitHub**, à chaque envoi : onglet *Actions* → *Vérifier* → rubrique *Artifacts* → `memoire-des-luttes-android` (un zip qui contient l'APK, gardé 14 jours).

## L'installer

1. Télécharger le fichier sur le téléphone et l'ouvrir.
2. Android demande d'autoriser l'installation depuis cette source (le navigateur ou le gestionnaire de fichiers) : accepter.
3. Pour une mise à jour : même chose. La nouvelle version remplace l'ancienne et **garde la collection**.

Dans l'app, *Plus* → *Installer l'app* → **« Chercher une mise à jour de l'app »** compare la version installée à celle du site.

## Ce qui change par rapport à l'app web

| | App web installée | Application Android |
|---|---|---|
| Installation | depuis le navigateur | depuis un fichier APK |
| Mises à jour | automatiques (proposées) | à télécharger (l'app vérifie sur demande) |
| Bouton retour d'Android | navigateur | ferme la fenêtre ouverte, revient à Manif, puis réduit l'app |
| Collection | dans le navigateur | dans l'application |
| Sauvegarde dans le cloud (Google) | selon le navigateur | **désactivée** : la collection ne quitte pas le téléphone |

Les deux ont **chacune leur collection**. L'application ne contacte Internet que sur demande : « Chercher de nouveaux packs » et « Chercher une mise à jour de l'app ».

## Construire l'APK

Automatique : l'action GitHub *Vérifier* (job `android`) et l'action *Publier* le construisent. Pour le faire à la main, il faut Java 21 et le kit Android :

```bash
npm run android -w app
```

```bash
cd app/android && ./gradlew assembleRelease
```

L'APK est dans `app/android/app/build/outputs/apk/release/app-release.apk`.

- **Numéro de version** : le nombre de modifications du dépôt (`git rev-list --count HEAD`), le même dans toutes les actions et toujours croissant. Android refuse d'installer une version plus ancienne par-dessus une plus récente.
- **Icônes et écran de démarrage** : `app/android/app/src/main/res/` (générés aux couleurs de l'app).
- **Permissions** : Internet (sur demande) et appareil photo (pendant le scan d'un QR) seulement.

## La clé de signature

Android n'installe une mise à jour que si elle est signée avec **la même clé** que la version installée. Sinon, il faut désinstaller, et la collection est perdue.

- **Phase de test** : la clé `app/android/cle-de-test.jks` est dans le dépôt (mot de passe dans `app/android/app/build.gradle`). Elle suffit tant que le dépôt est privé et que l'app circule entre proches.
- **Avant la diffusion publique** : créer une vraie clé, la garder hors du dépôt, et la donner à l'action par des secrets (`MDL_CLE_FICHIER`, `MDL_CLE_MOT_DE_PASSE`, `MDL_CLE_ALIAS`). Attention : changer de clé oblige toutes les personnes à désinstaller puis réinstaller. Le faire **avant** d'avoir de vrais utilisateurs, ou prévoir d'abord une fonction « Exporter / importer ma collection ».

## Et l'iPhone ?

Apple n'autorise l'installation d'applications que par l'App Store ou TestFlight, avec un compte développeur payant à un nom réel. Sur iPhone, on installe l'app web depuis Safari (Partager → Sur l'écran d'accueil).
