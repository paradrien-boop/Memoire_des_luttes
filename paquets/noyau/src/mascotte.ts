// Le chat et son quartier : points, stades, constructions. Fonctions pures.

export interface Stade {
  nom: string;
  points: number;
}

export const STADES: Stade[] = [
  { nom: "Chaton des rues", points: 0 },
  { nom: "Chat de gouttière", points: 30 },
  { nom: "Chat de grève", points: 100 },
  { nom: "Chat de barricade", points: 250 },
  { nom: "Chat sauvage", points: 500 },
];

/** Indice du stade atteint (0 à 4). */
export function stade(points: number): number {
  let s = 0;
  STADES.forEach((x, i) => { if (points >= x.points) s = i; });
  return s;
}

/** Part du chemin vers le stade suivant, entre 0 et 1 (1 au dernier stade). */
export function versStadeSuivant(points: number): number {
  const i = stade(points);
  if (i === STADES.length - 1) return 1;
  return (points - STADES[i].points) / (STADES[i + 1].points - STADES[i].points);
}

/* ---------- Le quartier ---------- */

/** Ce que chaque famille de cartes construit dans le quartier. */
export const ELEMENTS: Record<string, string> = {
  personnalite: "la fresque murale",
  evenement: "les banderoles et la barricade",
  lieu: "la plaque et le monument",
  mesure: "la Bourse du travail",
  concept: "l'atelier coopératif",
  courant: "le mur d'affiches",
  livre: "la bibliothèque populaire",
  chant: "le kiosque à musique",
};

/** Bonnes réponses nécessaires pour chaque niveau : esquissé, construit, animé. */
export const PALIERS = [1, 4, 10];

/** Niveau d'un élément du quartier (0 = rien, 1 = esquissé, 2 = construit, 3 = animé). */
export function niveau(bonnesReponses: number): number {
  return PALIERS.filter((p) => bonnesReponses >= p).length;
}

/* ---------- Récompenses ---------- */

export const POINTS_PAR_BONNE_REPONSE = 10;
export const FRAGMENTS_PAR_BOOSTER = 5;

/** Points gagnés pour une bonne réponse (doublés un jour de manif validé). */
export function pointsPourReponse(juste: boolean, jourDeManif: boolean): number {
  return juste ? POINTS_PAR_BONNE_REPONSE * (jourDeManif ? 2 : 1) : 0;
}

/** Ajoute un fragment de booster. Renvoie les fragments restants et les boosters complétés. */
export function ajouterFragment(fragments: number): { fragments: number; boosters: number } {
  const total = fragments + 1;
  return { fragments: total % FRAGMENTS_PAR_BOOSTER, boosters: Math.floor(total / FRAGMENTS_PAR_BOOSTER) };
}

/** Le chat dort quand on n'est pas venu depuis plus de 2 jours. Il se réveille au retour, sans rien perdre. */
export function dort(dernierQuiz: string | null, aujourdhui: string, joursEntre: (a: string, b: string) => number): boolean {
  return !!dernierQuiz && joursEntre(dernierQuiz, aujourdhui) > 2;
}
