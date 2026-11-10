// Formats des données, tels qu'ils sont écrits dans data/.

export type Rarete = "base" | "rare" | "legendaire";
export type RareteEvenement = "evenement";
export type Statut = "proposee" | "a-relire" | "validee" | "signee";

/** Rôle d'une rubrique sur la carte. */
export type Role = "title" | "sub" | "text" | "why" | "quote" | "quoteSrc" | "more";

export interface Champ {
  cle: string;
  role: Role;
  libelle: string;
  obligatoire?: boolean;
  aide?: string;
  max?: number;
  long?: boolean;
  exemple?: string;
}

export interface Famille {
  libelle: string;
  reserveeAuCollectif: boolean;
  champs: Champ[];
}

/** Une carte : quelques champs fixes, puis les rubriques propres à sa famille. */
export interface Carte {
  id: string;
  fam: string;
  rar: Rarete | RareteEvenement;
  title: string;
  links?: string[];
  src?: string;
  img?: string;
  serie?: string;
  statut?: Statut;
  [rubrique: string]: unknown;
}

export interface Serie {
  id: string;
  nom: string;
  description?: string;
  cartes: string[];
}

export interface Pack {
  type: "officiel" | "local";
  id: string;
  nom: string;
  series: Serie[];
  cartes: Carte[];
  signature?: unknown;
  /** Pour un pack local : le collectif qui l'a signé. */
  collectif?: { id: string; nom: string };
  /** Clés révoquées, publiées dans un pack officiel. */
  revocations?: string[];
  /** Nouvelles cartes d'événement (packs officiels seulement). */
  evenements?: CarteEvenement[];
}

export interface CarteEvenement extends Carte {
  rar: "evenement";
  tirage: number;
}

/** Ce que produit scripts/assembler.mjs à partir de data/. */
export interface Donnees {
  familles: Record<string, Famille>;
  packs: Pack[];
  evenements: CarteEvenement[];
  /** Clés publiques du collectif racine, intégrées à l'app (data/cles/racine.json). */
  cles?: { nom: string; racines: string[]; revocations?: string[] };
}
