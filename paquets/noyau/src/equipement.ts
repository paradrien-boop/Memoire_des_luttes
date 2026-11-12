// Le personnage et son équipement : chaque famille de cartes donne un objet, qui s'améliore avec la collection.
// Fonctions pures.

/** Où l'objet se porte sur le personnage. */
export type Emplacement = "tete" | "visage" | "cou" | "main" | "dos" | "ceinture";

/** Ce que l'objet permet pendant une bataille (« aucun » : il ne fait que s'afficher, et rapporte des points en plus). */
export type Pouvoir = "retirer" | "seconde-chance" | "indice" | "aucun";

export interface Objet {
  famille: string;
  nom: string;
  emplacement: Emplacement;
  pouvoir: Pouvoir;
  /** Ce que fait le pouvoir, en une phrase. */
  effet: string;
}

export const OBJETS: Record<string, Objet> = {
  chant: { famille: "chant", nom: "le porte-voix", emplacement: "main", pouvoir: "retirer", effet: "Fait taire une mauvaise réponse : elle disparaît." },
  evenement: { famille: "evenement", nom: "la banderole", emplacement: "dos", pouvoir: "seconde-chance", effet: "Après une erreur, la bataille reprend : tu peux répondre encore une fois." },
  livre: { famille: "livre", nom: "le livre", emplacement: "ceinture", pouvoir: "indice", effet: "Montre un indice tiré de la carte : sa famille et ses dates." },
  personnalite: { famille: "personnalite", nom: "le foulard rouge", emplacement: "cou", pouvoir: "aucun", effet: "Chaque bataille gagnée rapporte des points en plus." },
  mesure: { famille: "mesure", nom: "la casquette d'ouvrier", emplacement: "tete", pouvoir: "aucun", effet: "Chaque bataille gagnée rapporte des points en plus." },
  concept: { famille: "concept", nom: "les lunettes", emplacement: "visage", pouvoir: "aucun", effet: "Chaque bataille gagnée rapporte des points en plus." },
  courant: { famille: "courant", nom: "le drapeau", emplacement: "dos", pouvoir: "aucun", effet: "Chaque bataille gagnée rapporte des points en plus." },
  lieu: { famille: "lieu", nom: "la lanterne", emplacement: "main", pouvoir: "aucun", effet: "Chaque bataille gagnée rapporte des points en plus." },
};

/** Cartes d'une famille nécessaires pour chaque niveau de son objet : on le gagne dès la première carte. */
export const PALIERS_OBJET = [1, 3, 6];

/** Niveau d'un objet (0 = pas encore gagné, puis 1 à 3) selon le nombre de cartes différentes de sa famille. */
export function niveauObjet(cartesDeLaFamille: number): number {
  return PALIERS_OBJET.filter((p) => cartesDeLaFamille >= p).length;
}

/** Combien de cartes manquent pour le niveau suivant (null au niveau maximal). */
export function avantNiveauSuivant(cartesDeLaFamille: number): number | null {
  const prochain = PALIERS_OBJET.find((p) => p > cartesDeLaFamille);
  return prochain === undefined ? null : prochain - cartesDeLaFamille;
}

/** Les niveaux de tous les objets, à partir du nombre de cartes différentes possédées par famille. */
export function equipement(cartesParFamille: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.keys(OBJETS).map((f) => [f, niveauObjet(cartesParFamille[f] ?? 0)]));
}

/** Utilisations par jour d'un pouvoir : une par niveau de l'objet. */
export function utilisationsParJour(niveau: number): number {
  return niveau;
}

/** Points en plus par bataille gagnée, grâce aux objets sans pouvoir (1 par niveau). */
export function bonusDePoints(niveaux: Record<string, number>): number {
  return Object.entries(niveaux).filter(([f]) => OBJETS[f]?.pouvoir === "aucun").reduce((t, [, n]) => t + n, 0);
}
