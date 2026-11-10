# Clés

## `racine.json` : les clés publiques du collectif

C'est la liste des clés auxquelles **toutes les apps font confiance**. Elle est intégrée à l'app au moment de la construction.

Elle est vide tant que le collectif n'a pas créé sa clé. Pour la créer, sur un ordinateur **jamais connecté à Internet** :

```bash
npm run atelier -- cles --sortie /chemin/hors/du/depot/racine.cle-secrete.json
```

Puis copier la **clé publique** affichée dans `racines`. La clé secrète ne doit **jamais** entrer dans ce dépôt (le fichier `.gitignore` bloque les noms en `.cle-secrete`).

Plusieurs clés peuvent être listées, par exemple pour préparer le remplacement d'une clé.

## `demo.json` : une clé de démonstration, publique

Sa partie secrète est **publique** : n'importe qui peut signer avec. Elle n'est donc acceptée que dans le serveur de développement, la page de démo et les tests, **jamais dans l'app publiée**. Elle sert à essayer les QR signés sans la vraie clé.
