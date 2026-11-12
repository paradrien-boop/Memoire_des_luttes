# Tester sur de vrais téléphones

Tout ce qui pouvait être testé dans un navigateur l'est déjà, automatiquement, à chaque envoi sur GitHub (`npm run test:e2e`). Ce guide couvre ce que seul un vrai téléphone peut confirmer : l'installation, l'appareil photo, le mode avion réel, la batterie, deux téléphones face à face.

Il faut au moins **un Android** (Chrome) et **un iPhone** (Safari), idéalement deux téléphones pour les échanges. Sur Android, on peut aussi tester **l'application Android** (APK) : voir [android.md](android.md).

## Avant de commencer

1. **Ouvrir l'app** sur le téléphone : https://paradrien-boop.github.io/memoire-des-luttes-publication/app/ (publication : voir [publication.md](publication.md)).
2. **Créer la vraie clé du collectif**, sur un ordinateur jamais connecté à Internet, avec l'atelier :

   ```bash
   npm run atelier -- cles --sortie /cle-usb/racine.cle-secrete.json
   ```

   Copier la clé publique affichée dans `data/cles/racine.json`, puis envoyer sur `main` : l'app republiée fera confiance à cette clé. Sans elle, l'app publiée refuse tous les QR de stand et d'événement (la clé de démonstration n'y est jamais acceptée).
3. **Imprimer des planches de QR** de test, avec des dates qui couvrent les jours de test :

   ```bash
   npm run atelier -- qr-stand --cle /cle-usb/racine.cle-secrete.json --nom "Stand de test" --minimum rare --du 2026-11-15 --au 2026-11-30 --nombre 8 --sortie stand.html
   ```

   ```bash
   npm run atelier -- qr-evenement --cle /cle-usb/racine.cle-secrete.json --evenement ev-18mars2027 --du 2026-11-15 --au 2026-11-30 --a 8 --sortie evenement.html
   ```

   Ouvrir les fichiers HTML et les imprimer (ou les afficher sur un autre écran).

## Liste de vérifications

Pour chaque téléphone, noter ✓ ou ✗ (et ce qui s'est passé).

### Installation et hors ligne
- [ ] L'écran d'accueil s'affiche au premier lancement.
- [ ] Android : le bouton « Installer l'app » apparaît et fonctionne. iPhone : les étapes Safari (Partager → Sur l'écran d'accueil) fonctionnent.
- [ ] L'icône et le nom « Mémoire des luttes » sont corrects sur l'écran d'accueil.
- [ ] L'app installée s'ouvre en plein écran, sans barre d'adresse.
- [ ] **Mode avion** : l'app s'ouvre, toutes les pages marchent, la collection est là.
- [ ] Plus › Packs : l'empreinte de la clé du collectif correspond à celle affichée par l'atelier.

### En manif
- [ ] « Je manifeste », puis fermer l'app 50 minutes : à la réouverture, un booster a été gagné.
- [ ] Le compteur continue après avoir verrouillé et déverrouillé le téléphone.
- [ ] Batterie : noter le pourcentage perdu en une heure de compteur (app en arrière-plan).

### QR
- [ ] « Scanner un QR » demande l'accès à l'appareil photo ; en cas de refus, « Prendre le QR en photo » fonctionne.
- [ ] Un QR de stand imprimé donne un booster avec une carte rare garantie ; rescanné, il est refusé.
- [ ] Un QR de carte d'événement donne la carte numérotée ; un deuxième QR du même événement est refusé.
- [ ] Le scan fonctionne en plein soleil, à la tombée de la nuit, sur un QR froissé.
- [ ] L'appareil photo s'éteint (voyant éteint) dès qu'on ferme le scanner.

### Entre deux téléphones
- [ ] Donner une carte en double : le QR s'affiche, l'autre téléphone le scanne et reçoit la carte, le don se confirme.
- [ ] Partager une carte perso par QR : l'autre téléphone la reçoit dans « Cartes reçues ».

### Le reste
- [ ] Quiz du jour, nom du chat, quartier qui se construit.
- [ ] Éditeur : une carte avec une photo prise par le téléphone.
- [ ] Mode discret : le code fonctionne ; l'app se reverrouille après plus d'une minute dans une autre app.
- [ ] « Tout effacer » vide bien tout.
- [ ] Mise à jour : après un envoi sur `main`, l'app propose « Une nouvelle version de l'app est prête », et le redémarrage l'applique.
- [ ] Rien n'est coupé ni trop petit à l'écran, en thème clair et sombre.

## Signaler un problème

Ouvrir une *issue* avec le modèle **« Problème »**, en indiquant le téléphone, le système, le navigateur, ce qui était fait et ce qui s'est passé. Une capture d'écran aide beaucoup (en évitant tout ce qui permettrait d'identifier quelqu'un).
