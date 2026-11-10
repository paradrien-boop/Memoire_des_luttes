# Sources et droits

| Source | Usage | Droits |
|---|---|---|
| Wikipédia | Résumés | CC BY-SA : libre en créditant, avec la même licence. Indiquer « texte modifié » quand on réécrit. |
| Wikidata | Dates, liens entre cartes, influences | CC0 : totalement libre. Idéal pour générer les liens automatiquement. |
| Wikimedia Commons, Gallica | Portraits, gravures, affiches | Souvent domaine public. À vérifier image par image. |
| Wikisource | Citations et textes anciens | Domaine public |
| Dictionnaire critique (communisme ou marxisme) | Définitions des concepts | **Protégé par le droit d'auteur.** Accord de l'éditeur ou des auteurs nécessaire. Sinon : courtes citations sourcées et reformulation. |
| Le Maitron, marxists.org | Biographies militantes | Licences variables. Partenariat à envisager. |

## Conséquence

Comme une partie des textes vient de Wikipédia, **tout le contenu des cartes est publié en CC BY-SA 4.0**.

## Brouillons depuis Wikipédia et Wikidata

Sur un ordinateur connecté :

```bash
npm run brouillon -- --titre "Rosa Luxemburg" --famille personnalite --pack commune-1871 --serie comm
```

Le script lit le résumé de l'article Wikipédia (en français) et les données Wikidata (dates, métiers, auteurs, lieux), puis écrit la carte dans le pack et l'ajoute à la série. Il n'écrase jamais une carte existante.

La carte créée est un **brouillon** au statut `proposee` :
- le texte de Wikipédia est à **réécrire** (on ne le reprend pas tel quel, et la source reste citée) ;
- la rubrique « Pourquoi ça compte encore » est **vide** : le regard militant s'écrit à la main ;
- chaque fait et chaque source sont à vérifier avant validation et signature.
