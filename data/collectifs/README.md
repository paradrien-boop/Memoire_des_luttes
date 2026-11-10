# Collectifs

Un fichier JSON par collectif reconnu, créé par l'atelier à partir de la demande générée par le site (page Clés) :

```bash
npm run atelier -- reconnaitre --demande demande.json --cle /cle-usb/racine.cle-secrete.json --droits base,rare --expire 2027-12-31 --parrains collectif-a,collectif-b
```

Ces fichiers ne contiennent **que des informations publiques**, jamais de clé secrète :

```json
{
  "id": "cgt-douarnenez",
  "nom": "CGT Douarnenez",
  "presentation": "Deux ou trois phrases.",
  "themes": ["pêche", "conserveries"],
  "annuaire": true,
  "clePublique": "…",
  "parrains": ["collectif-a", "collectif-b"],
  "delegation": { "type": "delegation", "collectif": "cgt-douarnenez", "droits": ["base", "rare"], "expire": "2027-12-31", "par": "…", "signature": "…" }
}
```

Le collectif reçoit ce fichier : il en a besoin pour signer ses packs et ses QR de stand (`--delegation data/collectifs/<id>.json`).

- `npm run valider` vérifie que chaque délégation est bien signée par le collectif racine et correspond à sa fiche.
- Le site affiche dans l'annuaire les collectifs reconnus qui ont choisi d'y figurer (`"annuaire": true`).
- Pour retirer la confiance : `npm run atelier -- revoquer --publique <clé publique>`.

Aucun collectif n'est encore enregistré.
