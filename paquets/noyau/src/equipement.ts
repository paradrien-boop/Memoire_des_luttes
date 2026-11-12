// Le personnage et son équipement. Chaque famille de cartes débloque 3 objets (à 1, 3 et 6 cartes différentes).
// Le personnage a des emplacements (tête, visage, col, haut, mains, dos) : on choisit quel objet débloqué y mettre.
// Trois objets ont un pouvoir pendant les batailles, à condition d'être portés. Les autres rapportent des points.
// Fonctions pures.

export type Emplacement = "tete" | "visage" | "col" | "haut" | "main-droite" | "main-gauche" | "dos";

export const EMPLACEMENTS: { id: Emplacement; nom: string }[] = [
  { id: "tete", nom: "Tête" },
  { id: "visage", nom: "Visage" },
  { id: "col", nom: "Col" },
  { id: "haut", nom: "Haut" },
  { id: "main-droite", nom: "Main droite" },
  { id: "main-gauche", nom: "Main gauche" },
  { id: "dos", nom: "Dos" },
];

/** Ce que l'objet permet pendant une bataille, s'il est porté (« aucun » : il rapporte des points). */
export type Pouvoir = "retirer" | "seconde-chance" | "indice" | "aucun";

export interface Objet {
  id: string;
  nom: string;
  famille: string;
  /** Cartes différentes de la famille nécessaires pour le débloquer. */
  palier: number;
  emplacement: Emplacement;
  pouvoir: Pouvoir;
}

const o = (id: string, nom: string, famille: string, palier: number, emplacement: Emplacement, pouvoir: Pouvoir = "aucun"): Objet => ({ id, nom, famille, palier, emplacement, pouvoir });

export const OBJETS: Objet[] = [
  o("porte-voix", "le porte-voix", "chant", 1, "main-droite", "retirer"),
  o("accordeon", "l'accordéon", "chant", 3, "dos"),
  o("tambour", "le tambour", "chant", 6, "main-gauche"),
  o("banderole", "la banderole", "evenement", 1, "dos", "seconde-chance"),
  o("pancarte", "la pancarte", "evenement", 3, "main-gauche"),
  o("bonnet-phrygien", "le bonnet phrygien", "evenement", 6, "tete"),
  o("livre", "le livre", "livre", 1, "main-gauche", "indice"),
  o("journal", "le journal", "livre", 3, "main-droite"),
  o("binocles", "les binocles", "livre", 6, "visage"),
  o("foulard-rouge", "le foulard rouge", "personnalite", 1, "col"),
  o("tablier", "le tablier de cantinière", "personnalite", 3, "haut"),
  o("fichu", "le fichu rouge", "personnalite", 6, "tete"),
  o("casquette", "la casquette d'ouvrier", "mesure", 1, "tete"),
  o("bleu-de-chauffe", "le bleu de chauffe", "mesure", 3, "haut"),
  o("sac-de-tracts", "le sac de tracts", "mesure", 6, "dos"),
  o("lunettes", "les lunettes rondes", "concept", 1, "visage"),
  o("lavalliere", "la lavallière", "concept", 3, "col"),
  o("rose", "la rose rouge", "concept", 6, "main-gauche"),
  o("drapeau", "le drapeau rouge", "courant", 1, "main-droite"),
  o("beret", "le béret", "courant", 3, "tete"),
  o("cocarde", "la cocarde", "courant", 6, "col"),
  o("lanterne", "la lanterne", "lieu", 1, "main-droite"),
  o("echarpe", "l'écharpe", "lieu", 3, "col"),
  o("mariniere", "la marinière", "lieu", 6, "haut"),
];

export const OBJET_PAR_ID: Record<string, Objet> = Object.fromEntries(OBJETS.map((x) => [x.id, x]));

export const EFFETS: Record<Pouvoir, string> = {
  retirer: "Porté, il fait taire une mauvaise réponse pendant une bataille.",
  "seconde-chance": "Portée, elle donne une seconde chance après une erreur.",
  indice: "Porté, il donne un indice : la famille et les dates de la carte.",
  aucun: "Porté, il rapporte 1 point de plus à chaque bataille gagnée.",
};

/** Paliers de déblocage (cartes différentes d'une famille). */
export const PALIERS_OBJET = [1, 3, 6];

/** Niveau d'une famille (0 à 3) selon le nombre de cartes différentes possédées : il règle aussi les utilisations des pouvoirs. */
export function niveauObjet(cartesDeLaFamille: number): number {
  return PALIERS_OBJET.filter((p) => cartesDeLaFamille >= p).length;
}

/** Combien de cartes manquent pour le prochain objet de la famille (null s'ils sont tous débloqués). */
export function avantNiveauSuivant(cartesDeLaFamille: number): number | null {
  const prochain = PALIERS_OBJET.find((p) => p > cartesDeLaFamille);
  return prochain === undefined ? null : prochain - cartesDeLaFamille;
}

/** Les objets débloqués par la collection. */
export function objetsDebloques(cartesParFamille: Record<string, number>): Objet[] {
  return OBJETS.filter((x) => (cartesParFamille[x.famille] ?? 0) >= x.palier);
}

export type Equipe = Partial<Record<Emplacement, string | null>>;

/**
 * Garde l'équipement choisi s'il est toujours débloqué, et remplit les emplacements jamais choisis
 * avec le premier objet débloqué (un emplacement vidé exprès, à null, reste vide).
 */
export function equipementValide(equipe: Equipe, debloques: Objet[]): Equipe {
  const ids = new Set(debloques.map((x) => x.id));
  const r: Equipe = {};
  for (const e of EMPLACEMENTS) {
    const choisi = equipe[e.id];
    if (choisi === null) r[e.id] = null;
    else if (choisi && ids.has(choisi) && OBJET_PAR_ID[choisi].emplacement === e.id) r[e.id] = choisi;
    else {
      const premier = debloques.find((x) => x.emplacement === e.id);
      if (premier) r[e.id] = premier.id;
    }
  }
  return r;
}

/** L'objet porté qui donne un pouvoir, s'il y en a un. */
export function objetDuPouvoir(equipe: Equipe, pouvoir: Pouvoir): Objet | null {
  for (const id of Object.values(equipe)) if (id && OBJET_PAR_ID[id]?.pouvoir === pouvoir) return OBJET_PAR_ID[id];
  return null;
}

/** Utilisations par jour d'un pouvoir : le niveau de la famille de l'objet (1 à 3). */
export function utilisationsParJour(niveau: number): number {
  return niveau;
}

/** Points en plus par bataille gagnée : 1 par objet porté sans pouvoir. */
export function bonusDePoints(equipe: Equipe): number {
  return Object.values(equipe).filter((id) => id && OBJET_PAR_ID[id]?.pouvoir === "aucun").length;
}
