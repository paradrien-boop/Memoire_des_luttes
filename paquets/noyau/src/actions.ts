// Les actions militantes : l'utilisateur choisit celles qu'il se sent de mener (data/actions.json),
// les déclare quand il les a faites, et gagne fragments et boosters, plus un bonus quand il atteint son objectif
// de la semaine. Pas de preuve possible sans réseau ni GPS : c'est un jeu de confiance, borné par des plafonds.
// Pour la vie privée, on ne garde AUCUN historique : seulement les compteurs du jour et de la semaine en cours.
// Fonctions pures.

export type Periode = "jour" | "semaine" | "toujours";

export interface Recompense {
  fragments?: number;
  boosters?: number;
}

export interface Action {
  id: string;
  categorie: string;
  nom: string;
  description: string;
  conseil?: string;
  recompense: Recompense;
  plafond: { nombre: number; par: Periode };
}

export interface ConfigActions {
  objectifs: { choix: number[]; defaut: number; recompense: Recompense; manifCompte: boolean };
  categories: { id: string; nom: string }[];
  actions: Action[];
}

/** Les compteurs : seulement la période en cours, jamais d'historique daté. */
export interface Compteurs {
  jour: string;
  semaine: string;
  parJour: Record<string, number>;
  parSemaine: Record<string, number>;
  /** Pour les actions « une seule fois » (adhésion…) : déjà faites ou non. */
  toujours: Record<string, number>;
  /** Actions faites cette semaine (pour l'objectif). */
  totalSemaine: number;
  /** L'objectif de la semaine a déjà été récompensé. */
  objectifRecompense: boolean;
}

export const COMPTEURS_VIDES: Compteurs = { jour: "", semaine: "", parJour: {}, parSemaine: {}, toujours: {}, totalSemaine: 0, objectifRecompense: false };

/** La semaine ISO d'une date AAAA-MM-JJ, sous la forme « 2027-W11 ». */
export function semaineDe(date: string): string {
  const d = new Date(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10)));
  const jour = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - jour);
  const debut = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const n = Math.ceil(((d.getTime() - debut.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(n).padStart(2, "0")}`;
}

/** Remet à zéro ce qui appartient à un jour ou une semaine passés. */
export function aJour(c: Compteurs, date: string): Compteurs {
  const semaine = semaineDe(date);
  const r: Compteurs = { ...c, parJour: { ...c.parJour }, parSemaine: { ...c.parSemaine }, toujours: { ...c.toujours } };
  if (r.jour !== date) { r.jour = date; r.parJour = {}; }
  if (r.semaine !== semaine) { r.semaine = semaine; r.parSemaine = {}; r.totalSemaine = 0; r.objectifRecompense = false; }
  return r;
}

function deja(a: Action, c: Compteurs): number {
  return a.plafond.par === "jour" ? c.parJour[a.id] ?? 0 : a.plafond.par === "semaine" ? c.parSemaine[a.id] ?? 0 : c.toujours[a.id] ?? 0;
}

/** Combien de fois l'action peut encore être déclarée dans la période en cours. */
export function restantes(a: Action, compteurs: Compteurs, date: string): number {
  return Math.max(0, a.plafond.nombre - deja(a, aJour(compteurs, date)));
}

export interface ResultatAction {
  compteurs: Compteurs;
  /** Ce que rapporte l'action, plus le bonus de l'objectif s'il vient d'être atteint. */
  recompense: Required<Recompense>;
  objectifAtteint: boolean;
}

/** Ajoute la récompense de l'objectif si l'action fait atteindre l'objectif de la semaine (une fois par semaine). */
function compterPourObjectif(c: Compteurs, objectif: number, config: ConfigActions, r: Required<Recompense>): boolean {
  c.totalSemaine++;
  if (c.objectifRecompense || c.totalSemaine < objectif) return false;
  c.objectifRecompense = true;
  r.fragments += config.objectifs.recompense.fragments ?? 0;
  r.boosters += config.objectifs.recompense.boosters ?? 0;
  return true;
}

/** Déclare une action faite. @returns null si le plafond est atteint */
export function declarer(a: Action, compteurs: Compteurs, date: string, objectif: number, config: ConfigActions): ResultatAction | null {
  if (restantes(a, compteurs, date) < 1) return null;
  const c = aJour(compteurs, date);
  c.parJour[a.id] = (c.parJour[a.id] ?? 0) + 1;
  c.parSemaine[a.id] = (c.parSemaine[a.id] ?? 0) + 1;
  if (a.plafond.par === "toujours") c.toujours[a.id] = (c.toujours[a.id] ?? 0) + 1;
  const recompense = { fragments: a.recompense.fragments ?? 0, boosters: a.recompense.boosters ?? 0 };
  const objectifAtteint = compterPourObjectif(c, objectif, config, recompense);
  return { compteurs: c, recompense, objectifAtteint };
}

/** Un jour de manif validé compte aussi pour l'objectif de la semaine (si la configuration le prévoit). */
export function compterManif(compteurs: Compteurs, date: string, objectif: number, config: ConfigActions): ResultatAction {
  const c = aJour(compteurs, date);
  const recompense = { fragments: 0, boosters: 0 };
  const objectifAtteint = config.objectifs.manifCompte ? compterPourObjectif(c, objectif, config, recompense) : false;
  return { compteurs: c, recompense, objectifAtteint };
}

/** Texte court d'une récompense : « 2 fragments », « 1 booster »… */
export function texteRecompense(r: Recompense): string {
  const morceaux: string[] = [];
  if (r.boosters) morceaux.push(`${r.boosters} booster${r.boosters > 1 ? "s" : ""}`);
  if (r.fragments) morceaux.push(`${r.fragments} fragment${r.fragments > 1 ? "s" : ""}`);
  return morceaux.join(" et ");
}
