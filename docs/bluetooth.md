# Bluetooth (discussion mise en pause)

Idée : faire communiquer les téléphones directement en Bluetooth, comme l'application bitchat, sans réseau ni compte. Le code de bitchat est dans le domaine public : on pourrait reprendre sa partie Bluetooth.

## Contrainte technique

Le Bluetooth demande une **application installable**, pas une application web :
- depuis un navigateur, un téléphone peut chercher d'autres appareils mais ne peut pas s'annoncer lui-même ;
- sur iPhone, le Bluetooth web n'existe pas.

Il faudrait donc une app Android et iPhone, écrite une seule fois avec Flutter ou React Native par exemple.

## Ce que ça apporterait

| Usage | Intérêt |
|---|---|
| Échanger des cartes | On voit les camarades autour de soi (pseudos aléatoires) et on leur envoie une carte. |
| Diffuser les packs de proche en proche | Un pack signé se propage pendant la manif. Un pack falsifié est rejeté. |
| Balise sur les stands | Un téléphone ou un petit boîtier émet un code qui change chaque minute. Il faut être à quelques mètres. Une photo ne suffit pas. |
| Booster de cortège | Plus il y a d'utilisateurs autour de toi, plus le booster est gros. |

**Limite** : le Bluetooth est lent. Il convient aux cartes en texte et aux petits packs, pas aux packs avec beaucoup d'images.

## Risques pour l'anonymat

1. **Le Bluetooth se voit.** Un appareil de détection peut repérer qu'un téléphone utilise l'application. Propositions :
   - Bluetooth désactivé par défaut ;
   - activé seulement le temps d'un échange ;
   - identifiants qui changent en permanence ;
   - explication claire du risque dans l'application.
2. **Publier une app installable n'est pas anonyme.**
   - iPhone : Apple exige un compte développeur sous une identité réelle (personne ou association).
   - Android : distribution directe ou par F-Droid possible, mais Google a annoncé qu'il exigerait une identité vérifiée pour les développeurs, même hors Play Store. Calendrier à revérifier.
   - Piste : une association déclarée porte l'application, les rédacteurs et relecteurs restent anonymes.

## Recommandation retenue pour l'instant

Deux niveaux :
1. **La base** : l'application web, anonyme à publier, avec les QR. Pour tout le monde.
2. **En option** : une application Android avec Bluetooth, distribuée directement et par F-Droid. iPhone plus tard, si une association porte le projet.

Les deux lisent les mêmes cartes et les mêmes packs signés.
