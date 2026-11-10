# Collectifs

Un fichier JSON par collectif reconnu. Ces fichiers ne contiennent **que des informations publiques** : jamais de clé secrète.

```json
{
  "id": "exemple-collectif",
  "nom": "Nom affiché",
  "presentation": "Deux ou trois phrases.",
  "themes": ["histoire locale", "syndicalisme"],
  "annuaire": true,
  "clePublique": "ed25519:…",
  "delegation": {
    "droits": ["base", "rare"],
    "expire": "2027-11-10",
    "signature": "…signée par la clé racine…"
  },
  "parrains": ["autre-collectif", "encore-un"],
  "revoque": false
}
```

Aucun collectif n'est encore enregistré.
