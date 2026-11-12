// Fichier généré par scripts/construire.mjs à partir de data/. Ne pas modifier à la main.
window.MDL_DONNEES = {
 "familles": {
  "personnalite": {
   "libelle": "Personnalité",
   "reserveeAuCollectif": false,
   "champs": [
    {
     "cle": "title",
     "role": "title",
     "libelle": "Nom",
     "obligatoire": true,
     "exemple": "Ex. : Ambroise Croizat"
    },
    {
     "cle": "dates",
     "role": "sub",
     "libelle": "Naissance – mort",
     "exemple": "1901 – 1951"
    },
    {
     "cle": "role",
     "role": "sub",
     "libelle": "Métier, rôle",
     "exemple": "Ouvrier métallurgiste, ministre"
    },
    {
     "cle": "fait",
     "role": "text",
     "libelle": "Son parcours",
     "obligatoire": true,
     "aide": "Les faits, sourcés. Environ 400 signes.",
     "max": 600,
     "long": true
    },
    {
     "cle": "pourquoi",
     "role": "why",
     "libelle": "Pourquoi ça compte encore",
     "aide": "Ton regard militant.",
     "max": 400,
     "long": true
    },
    {
     "cle": "phrase",
     "role": "quote",
     "libelle": "Une phrase d'elle ou de lui"
    },
    {
     "cle": "phraseSrc",
     "role": "quoteSrc",
     "libelle": "Qui l'a dite"
    },
    {
     "cle": "plus",
     "role": "more",
     "libelle": "À lire",
     "aide": "Un livre, une biographie."
    }
   ]
  },
  "evenement": {
   "libelle": "Événement",
   "reserveeAuCollectif": false,
   "champs": [
    {
     "cle": "title",
     "role": "title",
     "libelle": "Nom de l'événement",
     "obligatoire": true,
     "exemple": "Ex. : La grève des Penn Sardin"
    },
    {
     "cle": "dates",
     "role": "sub",
     "libelle": "Date(s)",
     "exemple": "nov. 1924 – janv. 1925"
    },
    {
     "cle": "lieu",
     "role": "sub",
     "libelle": "Lieu",
     "exemple": "Douarnenez"
    },
    {
     "cle": "fait",
     "role": "text",
     "libelle": "Ce qui s'est passé",
     "obligatoire": true,
     "aide": "Les faits, sourcés.",
     "max": 600,
     "long": true
    },
    {
     "cle": "bilan",
     "role": "text",
     "libelle": "Ce qui a été gagné ou perdu",
     "max": 300,
     "long": true
    },
    {
     "cle": "pourquoi",
     "role": "why",
     "libelle": "Pourquoi ça compte encore",
     "aide": "Ton regard militant.",
     "max": 400,
     "long": true
    },
    {
     "cle": "phrase",
     "role": "quote",
     "libelle": "Un slogan, un témoignage"
    },
    {
     "cle": "phraseSrc",
     "role": "quoteSrc",
     "libelle": "Qui l'a dite"
    },
    {
     "cle": "plus",
     "role": "more",
     "libelle": "Pour aller plus loin"
    }
   ]
  },
  "lieu": {
   "libelle": "Lieu",
   "reserveeAuCollectif": false,
   "champs": [
    {
     "cle": "title",
     "role": "title",
     "libelle": "Nom du lieu",
     "obligatoire": true,
     "exemple": "Ex. : La Bourse du travail"
    },
    {
     "cle": "adresse",
     "role": "sub",
     "libelle": "Adresse ou ville"
    },
    {
     "cle": "dates",
     "role": "sub",
     "libelle": "Époque"
    },
    {
     "cle": "fait",
     "role": "text",
     "libelle": "Ce qui s'y est passé",
     "obligatoire": true,
     "max": 600,
     "long": true
    },
    {
     "cle": "pourquoi",
     "role": "why",
     "libelle": "Pourquoi ça compte encore",
     "aide": "Ton regard militant.",
     "max": 400,
     "long": true
    },
    {
     "cle": "phrase",
     "role": "quote",
     "libelle": "Une inscription, une plaque"
    },
    {
     "cle": "phraseSrc",
     "role": "quoteSrc",
     "libelle": "Qui l'a dite"
    },
    {
     "cle": "plus",
     "role": "more",
     "libelle": "Y aller"
    }
   ]
  },
  "mesure": {
   "libelle": "Mesure, loi",
   "reserveeAuCollectif": false,
   "champs": [
    {
     "cle": "title",
     "role": "title",
     "libelle": "Nom de la mesure",
     "obligatoire": true,
     "exemple": "Ex. : Les congés payés"
    },
    {
     "cle": "dates",
     "role": "sub",
     "libelle": "Date",
     "exemple": "20 juin 1936"
    },
    {
     "cle": "qui",
     "role": "sub",
     "libelle": "Obtenue par",
     "exemple": "La grève générale de mai-juin 1936"
    },
    {
     "cle": "fait",
     "role": "text",
     "libelle": "Ce qu'elle change",
     "obligatoire": true,
     "max": 600,
     "long": true
    },
    {
     "cle": "etat",
     "role": "text",
     "libelle": "Où en est-elle aujourd'hui ?",
     "aide": "Toujours en vigueur, attaquée, supprimée ?",
     "max": 300,
     "long": true
    },
    {
     "cle": "pourquoi",
     "role": "why",
     "libelle": "Pourquoi ça compte encore",
     "aide": "Ton regard militant.",
     "max": 400,
     "long": true
    },
    {
     "cle": "phrase",
     "role": "quote",
     "libelle": "Une phrase à retenir"
    },
    {
     "cle": "phraseSrc",
     "role": "quoteSrc",
     "libelle": "Qui l'a dite"
    },
    {
     "cle": "plus",
     "role": "more",
     "libelle": "Pour aller plus loin"
    }
   ]
  },
  "concept": {
   "libelle": "Concept",
   "reserveeAuCollectif": false,
   "champs": [
    {
     "cle": "title",
     "role": "title",
     "libelle": "Le mot",
     "obligatoire": true,
     "exemple": "Ex. : Plus-value"
    },
    {
     "cle": "dates",
     "role": "sub",
     "libelle": "Origine (qui, quand)",
     "exemple": "Karl Marx, 1867"
    },
    {
     "cle": "fait",
     "role": "text",
     "libelle": "Définition",
     "obligatoire": true,
     "aide": "Simple, sans jargon.",
     "max": 500,
     "long": true
    },
    {
     "cle": "exemple",
     "role": "text",
     "libelle": "Un exemple concret",
     "max": 300,
     "long": true
    },
    {
     "cle": "pourquoi",
     "role": "why",
     "libelle": "Pourquoi ça compte encore",
     "aide": "Ton regard militant.",
     "max": 400,
     "long": true
    },
    {
     "cle": "phrase",
     "role": "quote",
     "libelle": "Une citation"
    },
    {
     "cle": "phraseSrc",
     "role": "quoteSrc",
     "libelle": "Qui l'a dite"
    },
    {
     "cle": "plus",
     "role": "more",
     "libelle": "À lire"
    }
   ]
  },
  "courant": {
   "libelle": "Courant de pensée",
   "reserveeAuCollectif": false,
   "champs": [
    {
     "cle": "title",
     "role": "title",
     "libelle": "Nom du courant",
     "obligatoire": true,
     "exemple": "Ex. : Syndicalisme révolutionnaire"
    },
    {
     "cle": "dates",
     "role": "sub",
     "libelle": "Période"
    },
    {
     "cle": "figures",
     "role": "text",
     "libelle": "Figures principales",
     "max": 200
    },
    {
     "cle": "fait",
     "role": "text",
     "libelle": "Les idées clés",
     "obligatoire": true,
     "max": 600,
     "long": true
    },
    {
     "cle": "pourquoi",
     "role": "why",
     "libelle": "Pourquoi ça compte encore",
     "aide": "Ton regard militant.",
     "max": 400,
     "long": true
    },
    {
     "cle": "phrase",
     "role": "quote",
     "libelle": "Une citation"
    },
    {
     "cle": "phraseSrc",
     "role": "quoteSrc",
     "libelle": "Qui l'a dite"
    },
    {
     "cle": "plus",
     "role": "more",
     "libelle": "Texte fondateur"
    }
   ]
  },
  "livre": {
   "libelle": "Livre",
   "reserveeAuCollectif": false,
   "champs": [
    {
     "cle": "title",
     "role": "title",
     "libelle": "Titre",
     "obligatoire": true,
     "exemple": "Ex. : La Conquête du pain"
    },
    {
     "cle": "auteur",
     "role": "sub",
     "libelle": "Autrice, auteur"
    },
    {
     "cle": "dates",
     "role": "sub",
     "libelle": "Année"
    },
    {
     "cle": "fait",
     "role": "text",
     "libelle": "De quoi ça parle",
     "obligatoire": true,
     "max": 600,
     "long": true
    },
    {
     "cle": "phrase",
     "role": "quote",
     "libelle": "Un extrait"
    },
    {
     "cle": "phraseSrc",
     "role": "quoteSrc",
     "libelle": "Qui l'a dite"
    },
    {
     "cle": "pourquoi",
     "role": "why",
     "libelle": "Pourquoi ça compte encore",
     "aide": "Ton regard militant.",
     "max": 400,
     "long": true
    },
    {
     "cle": "plus",
     "role": "more",
     "libelle": "Où le trouver",
     "aide": "Domaine public, bibliothèque, librairie…"
    }
   ]
  },
  "chant": {
   "libelle": "Chant",
   "reserveeAuCollectif": false,
   "champs": [
    {
     "cle": "title",
     "role": "title",
     "libelle": "Titre",
     "obligatoire": true,
     "exemple": "Ex. : Bella Ciao"
    },
    {
     "cle": "auteur",
     "role": "sub",
     "libelle": "Paroles et musique"
    },
    {
     "cle": "dates",
     "role": "sub",
     "libelle": "Année"
    },
    {
     "cle": "fait",
     "role": "text",
     "libelle": "Son histoire",
     "obligatoire": true,
     "max": 600,
     "long": true
    },
    {
     "cle": "phrase",
     "role": "quote",
     "libelle": "Le refrain ou un couplet",
     "long": true
    },
    {
     "cle": "pourquoi",
     "role": "why",
     "libelle": "Pourquoi ça compte encore",
     "aide": "Ton regard militant.",
     "max": 400,
     "long": true
    },
    {
     "cle": "plus",
     "role": "more",
     "libelle": "Écouter"
    }
   ]
  },
  "manif": {
   "libelle": "Carte d'événement",
   "reserveeAuCollectif": true,
   "champs": [
    {
     "cle": "title",
     "role": "title",
     "libelle": "Nom de la journée",
     "obligatoire": true
    },
    {
     "cle": "dates",
     "role": "sub",
     "libelle": "Date"
    },
    {
     "cle": "orgas",
     "role": "sub",
     "libelle": "Appel de"
    },
    {
     "cle": "fait",
     "role": "text",
     "libelle": "Les revendications",
     "obligatoire": true,
     "long": true
    },
    {
     "cle": "phrase",
     "role": "quote",
     "libelle": "Le mot d'ordre"
    },
    {
     "cle": "pourquoi",
     "role": "why",
     "libelle": "Pourquoi ça compte encore",
     "aide": "Ton regard militant.",
     "max": 400,
     "long": true
    }
   ]
  }
 },
 "packs": [
  {
   "type": "officiel",
   "format": "memoire-des-luttes/pack",
   "version": 1,
   "id": "commune-1871",
   "nom": "La Commune de Paris, 1871",
   "editeur": "officiel",
   "statut": "brouillon — textes à relire",
   "licenceContenu": "CC BY-SA 4.0",
   "series": [
    {
     "id": "72j",
     "nom": "Les 72 jours",
     "description": "Paris, du 18 mars au 28 mai 1871.",
     "cartes": [
      "commune",
      "18mars",
      "semaine",
      "mur",
      "separation",
      "ateliers",
      "boulangers"
     ]
    },
    {
     "id": "comm",
     "nom": "Communard·es",
     "description": "Celles et ceux qui ont fait la Commune.",
     "cartes": [
      "louise",
      "varlin",
      "dmitrieff",
      "courbet",
      "pottier"
     ]
    },
    {
     "id": "idees",
     "nom": "Chants & idées",
     "description": "Ce que la Commune a laissé derrière elle.",
     "cartes": [
      "internationale",
      "cerises",
      "guerrecivile",
      "anarchisme"
     ]
    }
   ],
   "signature": null,
   "cartes": [
    {
     "id": "18mars",
     "fam": "evenement",
     "rar": "rare",
     "title": "Les canons de Montmartre",
     "dates": "18 mars 1871",
     "lieu": "Butte Montmartre",
     "fait": "À l'aube, l'armée vient saisir les canons de la Garde nationale, payés par souscription des Parisiens. Les femmes du quartier donnent l'alerte, la foule entoure les soldats, et ceux-ci refusent de tirer. Thiers et son gouvernement fuient à Versailles.",
     "pourquoi": "Quand la troupe fraternise avec le peuple, le pouvoir vacille. Le 18 mars montre que rien n'est joué tant que la rue tient.",
     "phrase": "Les soldats mettent la crosse en l'air.",
     "phraseSrc": "Expression de la fraternisation",
     "plus": "Regarder : le Sacré-Cœur, construit ensuite sur la butte pour « expier » la Commune.",
     "links": [
      "commune",
      "louise"
     ],
     "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
     "serie": "72j",
     "statut": "a-relire"
    },
    {
     "id": "anarchisme",
     "fam": "courant",
     "rar": "base",
     "title": "L'anarchisme",
     "dates": "XIXe siècle →",
     "fait": "Courant qui veut abolir l'État et toute domination, au profit de la libre association des individus et des communes. Proudhon, Bakounine, Kropotkine puis Louise Michel en sont des figures.",
     "pourquoi": "La Commune, fédération de quartiers et d'associations ouvrières, a nourri l'idée d'une société sans chefs.",
     "phrase": "La propriété, c'est le vol !",
     "phraseSrc": "Pierre-Joseph Proudhon, 1840",
     "plus": "Lire : Pierre Kropotkine, La Conquête du pain (1892).",
     "links": [
      "louise",
      "guerrecivile"
     ],
     "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
     "serie": "idees",
     "statut": "a-relire"
    },
    {
     "id": "ateliers",
     "fam": "mesure",
     "rar": "rare",
     "title": "Les ateliers aux travailleurs",
     "dates": "16 avril 1871",
     "fait": "Un décret fait recenser les ateliers abandonnés par leurs patrons, partis à Versailles, pour les confier à des coopératives formées par les ouvriers qui y travaillaient.",
     "pourquoi": "C'est l'idée d'autogestion : celles et ceux qui produisent décident. Elle reviendra dans les usines occupées, de Lip en 1973 aux coopératives d'aujourd'hui.",
     "phrase": "C'est possible : on fabrique, on vend, on se paie.",
     "phraseSrc": "Les grévistes de Lip, 1973",
     "plus": "Concept lié : autogestion.",
     "links": [
      "varlin",
      "dmitrieff",
      "anarchisme"
     ],
     "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
     "serie": "72j",
     "statut": "a-relire"
    },
    {
     "id": "boulangers",
     "fam": "mesure",
     "rar": "base",
     "title": "Plus de nuits pour les boulangers",
     "dates": "20 avril 1871",
     "fait": "La Commune interdit le travail de nuit dans les boulangeries, où les ouvriers enchaînaient des nuits épuisantes. Quelques jours plus tard, elle interdit aussi les amendes et retenues que les patrons infligeaient sur les salaires.",
     "pourquoi": "Des mesures concrètes pour la vie de tous les jours. La politique, c'est aussi les horaires de travail et la fiche de paie.",
     "phrase": "",
     "phraseSrc": "",
     "plus": "Chercher : les décrets sociaux de la Commune.",
     "links": [
      "ateliers"
     ],
     "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
     "serie": "72j",
     "statut": "a-relire"
    },
    {
     "id": "cerises",
     "fam": "chant",
     "rar": "base",
     "title": "Le Temps des cerises",
     "auteur": "Jean-Baptiste Clément / Antoine Renard",
     "dates": "1866",
     "fait": "Chanson d'amour écrite par Jean-Baptiste Clément en 1866, avant la Commune. Clément, élu communard, la dédie plus tard à Louise, une ambulancière rencontrée sur une barricade pendant la Semaine sanglante.",
     "pourquoi": "Une chanson d'amour devenue chant de mémoire : la nostalgie de la Commune s'entend à chaque couplet.",
     "phrase": "J'aimerai toujours le temps des cerises, et le souvenir que je garde au cœur.",
     "phraseSrc": "Jean-Baptiste Clément",
     "plus": "Écouter : la version de Cora Vaucaire, ou d'Yves Montand.",
     "links": [
      "semaine"
     ],
     "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
     "serie": "idees",
     "statut": "a-relire"
    },
    {
     "id": "commune",
     "fam": "evenement",
     "rar": "legendaire",
     "title": "La Commune de Paris",
     "dates": "18 mars – 28 mai 1871",
     "lieu": "Paris",
     "fait": "Après la défaite contre la Prusse et un siège qui a affamé la ville, le peuple de Paris refuse de rendre ses canons au gouvernement d'Adolphe Thiers. Le 26 mars, Paris élit son propre conseil : la Commune. Pendant 72 jours, la ville s'administre elle-même.",
     "pourquoi": "Pour la première fois, un pouvoir ouvrier gouverne une capitale. La Commune prouve que les gens ordinaires peuvent faire tourner une ville sans patrons ni notables. Elle montre aussi que les possédants sont prêts à noyer cette expérience dans le sang.",
     "phrase": "Le Paris ouvrier, avec sa Commune, sera célébré à jamais comme le glorieux fourrier d'une société nouvelle.",
     "phraseSrc": "Karl Marx, La Guerre civile en France, 1871",
     "plus": "Lire : Jacques Rougerie, Paris libre 1871.",
     "links": [
      "18mars",
      "semaine",
      "louise",
      "guerrecivile"
     ],
     "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
     "serie": "72j",
     "statut": "a-relire"
    },
    {
     "id": "courbet",
     "fam": "personnalite",
     "rar": "base",
     "title": "Gustave Courbet",
     "dates": "1819 – 1877",
     "role": "Peintre",
     "fait": "Peintre réaliste, il préside la Fédération des artistes de Paris pendant la Commune. Il avait réclamé le déboulonnage de la colonne Vendôme, symbole des guerres de Napoléon, abattue le 16 mai 1871. Condamné à payer sa reconstruction, il meurt ruiné en exil en Suisse.",
     "pourquoi": "L'art peut prendre parti. Courbet peignait les travailleurs et les gens ordinaires, et il a payé son engagement jusqu'au bout.",
     "phrase": "",
     "phraseSrc": "",
     "plus": "Voir : Un enterrement à Ornans, musée d'Orsay.",
     "links": [
      "commune"
     ],
     "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
     "serie": "comm",
     "statut": "a-relire"
    },
    {
     "id": "dmitrieff",
     "fam": "personnalite",
     "rar": "rare",
     "title": "Élisabeth Dmitrieff",
     "dates": "1851 – 1910",
     "role": "Militante internationaliste",
     "fait": "Venue de Russie, en lien avec l'Internationale à Londres, elle cofonde à 20 ans l'Union des femmes pour la défense de Paris et les soins aux blessés. L'Union organise des ateliers coopératifs de femmes et mobilise pour les barricades.",
     "pourquoi": "La Commune n'a pas été faite que par des hommes. Les femmes y ont pris les armes et la parole, alors qu'elles n'avaient même pas le droit de vote.",
     "phrase": "",
     "phraseSrc": "",
     "plus": "Lire : Édith Thomas, Les Pétroleuses (1963).",
     "links": [
      "louise",
      "ateliers"
     ],
     "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
     "serie": "comm",
     "statut": "a-relire"
    },
    {
     "id": "guerrecivile",
     "fam": "livre",
     "rar": "rare",
     "title": "La Guerre civile en France",
     "auteur": "Karl Marx",
     "dates": "1871",
     "fait": "Texte écrit par Marx pour l'Association internationale des travailleurs et publié juste après la Semaine sanglante. Il y analyse la Commune comme une forme nouvelle de gouvernement de la classe ouvrière.",
     "pourquoi": "La Commune devient un modèle pour tout le mouvement révolutionnaire. Ce texte est la porte d'entrée de ce débat, qui dure encore.",
     "phrase": "La classe ouvrière ne peut pas se contenter de prendre tel quel l'appareil d'État et de le faire fonctionner pour son propre compte.",
     "phraseSrc": "Karl Marx",
     "plus": "Lire en entier : le texte est dans le domaine public.",
     "links": [
      "commune",
      "anarchisme"
     ],
     "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
     "serie": "idees",
     "statut": "a-relire"
    },
    {
     "id": "internationale",
     "fam": "chant",
     "rar": "rare",
     "title": "L'Internationale",
     "auteur": "Eugène Pottier / Pierre Degeyter",
     "dates": "1871 / 1888",
     "fait": "Poème d'Eugène Pottier, écrit juste après l'écrasement de la Commune. En 1888, Pierre Degeyter, ouvrier lillois, le met en musique. Il devient l'hymne du mouvement ouvrier dans le monde entier.",
     "pourquoi": "Né d'une défaite, ce chant est repris depuis dans presque toutes les langues. La preuve qu'une lutte vaincue peut continuer à vivre.",
     "phrase": "Debout ! les damnés de la terre ! Debout ! les forçats de la faim !",
     "phraseSrc": "Premier couplet",
     "plus": "Chanter : en fin de manif, évidemment.",
     "links": [
      "pottier"
     ],
     "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
     "serie": "idees",
     "statut": "a-relire"
    },
    {
     "id": "louise",
     "fam": "personnalite",
     "rar": "legendaire",
     "title": "Louise Michel",
     "dates": "1830 – 1905",
     "role": "Institutrice, communarde",
     "fait": "Institutrice, poétesse, combattante. Pendant la Commune, elle soigne, enseigne et prend le fusil. Condamnée, elle est déportée en Nouvelle-Calédonie, où elle prend le parti des Kanak révoltés en 1878. Rentrée en 1880, elle parcourt la France pour défendre l'anarchisme.",
     "pourquoi": "Elle refuse de demander grâce et de se taire. Une figure qui relie la lutte des classes, celle des femmes et l'anticolonialisme.",
     "phrase": "Le pouvoir est maudit, c'est pour cela que je suis anarchiste.",
     "phraseSrc": "Louise Michel",
     "plus": "Lire : Louise Michel, La Commune, histoire et souvenirs (1898).",
     "links": [
      "commune",
      "18mars",
      "anarchisme"
     ],
     "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
     "serie": "comm",
     "statut": "a-relire"
    },
    {
     "id": "mur",
     "fam": "lieu",
     "rar": "base",
     "title": "Le Mur des Fédérés",
     "adresse": "Père-Lachaise, Paris 20e",
     "dates": "28 mai 1871",
     "fait": "Au cimetière du Père-Lachaise, 147 combattants de la Commune sont fusillés contre ce mur puis jetés dans une fosse commune. C'est l'un des tout derniers épisodes de la Semaine sanglante.",
     "pourquoi": "Chaque année, le mouvement ouvrier y monte en cortège. Un lieu de mémoire qui reste un lieu de lutte.",
     "phrase": "Aux morts de la Commune, 21-28 mai 1871.",
     "phraseSrc": "Plaque du mur",
     "plus": "Aller : cimetière du Père-Lachaise, Paris 20e.",
     "links": [
      "semaine",
      "commune"
     ],
     "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
     "serie": "72j",
     "statut": "a-relire"
    },
    {
     "id": "pottier",
     "fam": "personnalite",
     "rar": "base",
     "title": "Eugène Pottier",
     "dates": "1816 – 1887",
     "role": "Poète, élu de la Commune",
     "fait": "Dessinateur sur étoffes et poète, élu à la Commune. Caché pendant la Semaine sanglante, il écrit en juin 1871 le poème L'Internationale. Il vit ensuite en exil aux États-Unis jusqu'à l'amnistie de 1880.",
     "pourquoi": "Un poète ouvrier qui transforme la défaite en espoir. Ses chansons ont survécu à tous ceux qui l'ont vaincu.",
     "phrase": "Tout ça n'empêche pas, Nicolas, qu'la Commune n'est pas morte.",
     "phraseSrc": "Eugène Pottier, Elle n'est pas morte, 1886",
     "plus": "Écouter : Elle n'est pas morte.",
     "links": [
      "internationale"
     ],
     "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
     "serie": "comm",
     "statut": "a-relire"
    },
    {
     "id": "semaine",
     "fam": "evenement",
     "rar": "rare",
     "title": "La Semaine sanglante",
     "dates": "21 – 28 mai 1871",
     "fait": "Les troupes versaillaises entrent dans Paris. Barricade après barricade, les fédérés sont écrasés. Exécutions sommaires et fusillades de masse : selon les historiens, le nombre de morts va de plusieurs milliers à environ 20 000. Viennent ensuite les procès, les déportations et l'exil.",
     "pourquoi": "C'est la répression la plus meurtrière de l'histoire de Paris. Elle rappelle ce que l'ordre établi est prêt à faire quand il se sent menacé.",
     "phrase": "Le sol est jonché de leurs cadavres ; ce spectacle affreux servira de leçon.",
     "phraseSrc": "Adolphe Thiers, mai 1871",
     "plus": "Lire : Prosper-Olivier Lissagaray, Histoire de la Commune de 1871 (1876).",
     "links": [
      "mur",
      "varlin",
      "cerises"
     ],
     "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
     "serie": "72j",
     "statut": "a-relire"
    },
    {
     "id": "separation",
     "fam": "mesure",
     "rar": "base",
     "title": "Séparer l'Église et l'État",
     "dates": "2 avril 1871",
     "fait": "Par décret, la Commune sépare l'Église de l'État, supprime le budget des cultes et déclare propriété nationale les biens des congrégations religieuses. Elle lance aussi une école laïque et gratuite.",
     "pourquoi": "La République mettra 34 ans à faire de même, avec la loi de 1905. Sur bien des sujets, la Commune avait un temps d'avance.",
     "phrase": "",
     "phraseSrc": "",
     "plus": "Comparer : la loi du 9 décembre 1905.",
     "links": [
      "commune"
     ],
     "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
     "serie": "72j",
     "statut": "a-relire"
    },
    {
     "id": "varlin",
     "fam": "personnalite",
     "rar": "rare",
     "title": "Eugène Varlin",
     "dates": "1839 – 1871",
     "role": "Ouvrier relieur",
     "fait": "Ouvrier relieur, organisateur de grèves et de coopératives, membre de l'Association internationale des travailleurs. Élu à la Commune, il s'occupe des finances puis du ravitaillement. Arrêté le 28 mai, il est battu par la foule puis fusillé à Montmartre.",
     "pourquoi": "Il incarne l'ouvrier qui s'organise lui-même : syndicat, coopérative, Internationale. Un pont entre la lutte au travail et la lutte pour le pouvoir.",
     "phrase": "",
     "phraseSrc": "",
     "plus": "Chercher : l'Association internationale des travailleurs (1864).",
     "links": [
      "ateliers",
      "semaine"
     ],
     "src": "D'après Wikipédia (CC BY-SA), texte réécrit",
     "serie": "comm",
     "statut": "a-relire"
    }
   ],
   "ennemis": [
    {
     "id": "versaillais",
     "nom": "Le Versaillais",
     "epoque": "1871",
     "description": "Soldat de l'armée du gouvernement réfugié à Versailles, envoyé reprendre Paris.",
     "replique": "Rendez les canons de Montmartre !",
     "defaite": "Crosse en l'air… je rentre chez moi !",
     "dessin": "soldat",
     "familles": [
      "evenement",
      "lieu"
     ]
    },
    {
     "id": "proprietaire",
     "nom": "Le Propriétaire",
     "epoque": "1871",
     "description": "Il réclame les loyers du siège, que la Commune a remis aux locataires par décret le 29 mars 1871.",
     "replique": "Trois termes de retard ? Dehors !",
     "defaite": "Mes loyers… remis ?!",
     "dessin": "proprietaire",
     "familles": [
      "mesure"
     ]
    },
    {
     "id": "patron",
     "nom": "Le Patron d'atelier",
     "epoque": "1871",
     "description": "Parti à Versailles, il veut reprendre l'atelier que ses ouvriers font tourner en coopérative.",
     "replique": "Sans moi, vous ne savez rien faire !",
     "defaite": "Ils s'en sortent très bien sans moi…",
     "dessin": "patron",
     "familles": [
      "concept",
      "mesure"
     ]
    },
    {
     "id": "censeur",
     "nom": "Le Censeur",
     "epoque": "XIXe siècle",
     "description": "Il interdit les journaux, les chansons et les livres qui dérangent l'ordre établi.",
     "replique": "Cette chanson est interdite !",
     "defaite": "On ne peut pas interdire ce que tout le monde chante…",
     "dessin": "censeur",
     "familles": [
      "chant",
      "livre",
      "courant"
     ]
    },
    {
     "id": "mouchard",
     "nom": "Le Mouchard",
     "epoque": "1871",
     "description": "Il dénonce les communards à la police versaillaise.",
     "replique": "Je sais où tu te caches…",
     "defaite": "Je n'ai rien vu, rien entendu !",
     "dessin": "mouchard",
     "familles": [
      "personnalite"
     ]
    },
    {
     "id": "general-versaillais",
     "nom": "Le Général versaillais",
     "epoque": "1871",
     "description": "Il commande la reprise de Paris pendant la Semaine sanglante. Il n'apparaît que lorsque la série « Les 72 jours » est complète.",
     "replique": "Pas de quartier pour les fédérés !",
     "defaite": "La Commune n'est pas morte ?!",
     "dessin": "general",
     "familles": [],
     "chef": {
      "serie": "72j"
     }
    }
   ]
  }
 ],
 "evenements": [
  {
   "id": "ev-18mars2027",
   "fam": "manif",
   "rar": "evenement",
   "title": "Vive la Commune !",
   "dates": "18 mars 2027 (exemple)",
   "orgas": "Collectif Mémoire des luttes",
   "fait": "Rassemblement pour l'anniversaire de la Commune. Pour la défense des services publics, contre la réforme des retraites, pour la mémoire des luttes.",
   "phrase": "La Commune n'est pas morte !",
   "pourquoi": "Tu y étais. Cette carte ne s'obtient qu'en étant sur place ce jour-là, en scannant le QR du stand.",
   "tirage": 500,
   "src": "Exemple de démonstration",
   "exemple": true,
   "statut": "exemple"
  }
 ],
 "cles": {
  "nom": "Mémoire des luttes",
  "racines": []
 },
 "actions": {
  "objectifs": {
   "choix": [
    1,
    2,
    3,
    5,
    7
   ],
   "defaut": 2,
   "recompense": {
    "boosters": 1
   },
   "manifCompte": true
  },
  "categories": [
   {
    "id": "rue",
    "nom": "Dans la rue"
   },
   {
    "id": "collectif",
    "nom": "En collectif"
   },
   {
    "id": "solidarite",
    "nom": "Solidarité"
   },
   {
    "id": "memoire",
    "nom": "Mémoire et culture"
   }
  ],
  "actions": [
   {
    "id": "tractage",
    "categorie": "rue",
    "nom": "Distribuer des tracts",
    "description": "Sur un marché, à la sortie d'une gare ou d'une entreprise.",
    "recompense": {
     "fragments": 2
    },
    "plafond": {
     "nombre": 1,
     "par": "jour"
    }
   },
   {
    "id": "affichage",
    "categorie": "rue",
    "nom": "Coller des affiches",
    "description": "Sur les panneaux d'affichage libre de ta commune.",
    "conseil": "L'affichage hors des panneaux d'affichage libre est puni d'une amende. Renseigne-toi auprès de ta mairie sur leur emplacement.",
    "recompense": {
     "fragments": 1
    },
    "plafond": {
     "nombre": 1,
     "par": "jour"
    }
   },
   {
    "id": "piquet",
    "categorie": "rue",
    "nom": "Soutenir un piquet de grève",
    "description": "Passer, apporter un café, rester un moment avec les grévistes.",
    "recompense": {
     "boosters": 1
    },
    "plafond": {
     "nombre": 2,
     "par": "semaine"
    }
   },
   {
    "id": "greve",
    "categorie": "collectif",
    "nom": "Faire grève",
    "description": "Une journée de grève, dans ton entreprise, ton administration ou ton lycée.",
    "recompense": {
     "boosters": 1
    },
    "plafond": {
     "nombre": 1,
     "par": "jour"
    }
   },
   {
    "id": "assemblee",
    "categorie": "collectif",
    "nom": "Participer à une assemblée",
    "description": "Assemblée générale, réunion de section, de collectif ou de quartier.",
    "recompense": {
     "fragments": 2
    },
    "plafond": {
     "nombre": 2,
     "par": "semaine"
    }
   },
   {
    "id": "adhesion",
    "categorie": "collectif",
    "nom": "Rejoindre une organisation",
    "description": "Adhérer à un syndicat, une association ou un collectif.",
    "recompense": {
     "boosters": 2
    },
    "plafond": {
     "nombre": 1,
     "par": "toujours"
    }
   },
   {
    "id": "caisse",
    "categorie": "solidarite",
    "nom": "Donner à une caisse de grève",
    "description": "Quel que soit le montant.",
    "recompense": {
     "boosters": 1
    },
    "plafond": {
     "nombre": 1,
     "par": "semaine"
    }
   },
   {
    "id": "entraide",
    "categorie": "solidarite",
    "nom": "Aider une action de solidarité",
    "description": "Collecte, cantine populaire, maraude, aide aux devoirs, soutien juridique…",
    "recompense": {
     "fragments": 2
    },
    "plafond": {
     "nombre": 2,
     "par": "semaine"
    }
   },
   {
    "id": "lecture",
    "categorie": "memoire",
    "nom": "Lire un texte de lutte",
    "description": "Un livre, un article, une brochure sur l'histoire ou les idées des luttes.",
    "recompense": {
     "fragments": 1
    },
    "plafond": {
     "nombre": 2,
     "par": "semaine"
    }
   },
   {
    "id": "transmettre",
    "categorie": "memoire",
    "nom": "Raconter une histoire de lutte",
    "description": "À un·e proche, un·e collègue, un·e enfant : une carte, une date, une figure.",
    "recompense": {
     "fragments": 1
    },
    "plafond": {
     "nombre": 1,
     "par": "jour"
    }
   },
   {
    "id": "commemoration",
    "categorie": "memoire",
    "nom": "Aller à une commémoration",
    "description": "Montée au Mur des Fédérés, hommage, visite d'un lieu de mémoire.",
    "recompense": {
     "boosters": 1
    },
    "plafond": {
     "nombre": 1,
     "par": "semaine"
    }
   }
  ]
 },
 "regles": {
  "cartesMaxParJour": 9
 }
};
