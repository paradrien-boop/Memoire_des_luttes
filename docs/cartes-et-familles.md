# Les familles de cartes

Chaque famille a ses propres rubriques. La définition qui fait foi est dans [`data/familles/familles.json`](../data/familles/familles.json). Ce document la résume.

Toutes les familles ont aussi la rubrique **« Pourquoi ça compte encore »**. Les rubriques en **gras** sont obligatoires.

| Famille | Rubriques |
|---|---|
| Personnalité | **Nom**, naissance – mort, métier ou rôle, **son parcours**, une phrase d'elle ou de lui, à lire |
| Événement | **Nom**, dates, lieu, **ce qui s'est passé**, ce qui a été gagné ou perdu, un slogan, pour aller plus loin |
| Lieu | **Nom**, adresse, époque, **ce qui s'y est passé**, une inscription, y aller |
| Mesure, loi | **Nom**, date, obtenue par, **ce qu'elle change**, où en est-elle aujourd'hui, pour aller plus loin |
| Concept | **Le mot**, origine, **définition**, un exemple concret, une citation, à lire |
| Courant de pensée | **Nom**, période, figures principales, **les idées clés**, une citation, texte fondateur |
| Livre | **Titre**, autrice ou auteur, année, **de quoi ça parle**, un extrait, où le trouver |
| Chant | **Titre**, paroles et musique, année, **son histoire**, le refrain, écouter |
| Carte d'événement | Réservée au collectif. **Nom de la journée**, date, appel de, **les revendications**, le mot d'ordre |

## Format d'une carte

Une carte est un fichier JSON dans le dossier `cartes/` de son pack. Exemple simplifié :

```json
{
  "id": "louise",
  "fam": "personnalite",
  "rar": "legendaire",
  "title": "Louise Michel",
  "dates": "1830 – 1905",
  "role": "Institutrice, communarde",
  "fait": "…",
  "pourquoi": "…",
  "phrase": "Le pouvoir est maudit, c'est pour cela que je suis anarchiste.",
  "phraseSrc": "Louise Michel",
  "plus": "Lire : …",
  "links": ["commune", "18mars", "anarchisme"],
  "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
  "serie": "comm",
  "statut": "a-relire"
}
```

## Statuts d'une carte

| Statut | Signification |
|---|---|
| `proposee` | Envoyée, pas encore relue |
| `a-relire` | Écrite, en attente de relecture des faits et des sources |
| `validee` | Relue par deux personnes, prête à signer |
| `signee` | Intégrée à un pack signé et publié. Elle ne peut plus être modifiée : une correction donne une nouvelle version. |

> Toutes les cartes du pack de départ sont pour l'instant au statut `a-relire`. Elles ont été rédigées pour le prototype et doivent être vérifiées.

## Règles éditoriales

- Militant dans le regard, rigoureux dans les faits.
- Environ 400 signes pour la rubrique principale.
- Chaque fait doit avoir une source. Quand les historiens ne sont pas d'accord (par exemple sur un bilan de victimes), donner une fourchette.
- Une citation douteuse ou non sourcée ne va pas sur une carte.
