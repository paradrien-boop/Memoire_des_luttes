# Site web

Le site de Mémoire des luttes, publié à la racine de Codeberg Pages, avec l'app sous `/app/` et les packs sous `/packs/`.

| Page | Contenu |
|---|---|
| Accueil | Présentation, bouton et QR vers l'app, installation Android et iPhone, empreinte de la clé du collectif |
| Les cartes | Toutes les cartes des packs et leur état de relecture, avec un filtre |
| Packs | Les packs à télécharger, avec leur signature vérifiée à la construction |
| Collectifs | L'annuaire des collectifs reconnus (ceux qui le souhaitent), et comment se faire reconnaître |
| Clés | Les clés de confiance, et la création de la clé d'un collectif dans le navigateur (rien n'est envoyé) |
| Participer | Proposer et corriger des cartes, règles du débat, lien vers l'espace de débat (`data/site.json`) |

Le site lit `data/` au moment de sa construction (module `virtual:mdl-site`, dans `vite.config.ts`). Comme l'app, il ne charge rien depuis un autre site, ne dépose aucun cookie et ne mesure aucune visite.

```bash
npm run dev:site
```

```bash
npm run publier
```

La seconde commande construit l'app, le site et les packs dans `publication/`, exactement comme sur Codeberg Pages.
