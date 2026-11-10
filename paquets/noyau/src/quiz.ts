// Quiz du jour : questions fabriquées à partir des cartes possédées, et mémoire par carte.
// Fonctions pures : le hasard est une graine, pour que les questions du jour restent les mêmes toute la journée.
import type { Carte } from "./formats";
import type { Hasard } from "./regles";

export type TypeQuestion = "ecrite" | "annee" | "citation" | "carte" | "role" | "lien";

export interface Question {
  carteId: string;
  type: TypeQuestion;
  enonce: string;
  /** Texte à montrer en plus de l'énoncé (citation, extrait avec le titre masqué). */
  extrait?: string;
  choix: string[];
  /** Position de la bonne réponse dans « choix ». */
  bonne: number;
  explication?: string;
}

/** Question écrite par l'équipe éditoriale, dans le fichier de la carte. */
export interface QuestionEcrite {
  q: string;
  bonne: string;
  fausses: string[];
  explication?: string;
}

/* ---------- Hasard reproductible ---------- */

/** Générateur pseudo-aléatoire (mulberry32) à partir d'un texte. */
export function hasardDepuis(graine: string): Hasard {
  let h = 1779033703 ^ graine.length;
  for (let i = 0; i < graine.length; i++) {
    h = Math.imul(h ^ graine.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function melanger<T>(liste: T[], hasard: Hasard): T[] {
  const l = [...liste];
  for (let i = l.length - 1; i > 0; i--) {
    const j = Math.floor(hasard() * (i + 1));
    [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
}

const texte = (c: Carte, cle: string) => (typeof c[cle] === "string" ? (c[cle] as string).trim() : "");
const uniques = (l: string[]) => [...new Set(l.filter(Boolean))];

/** Assemble une question à 4 choix, ou rien s'il n'y a pas assez de mauvaises réponses distinctes. */
function assembler(base: Omit<Question, "choix" | "bonne">, bonne: string, fausses: string[], hasard: Hasard): Question | null {
  const f = melanger(uniques(fausses).filter((x) => x.toLowerCase() !== bonne.toLowerCase()), hasard).slice(0, 3);
  if (f.length < 3) return null;
  const choix = melanger([bonne, ...f], hasard);
  return { ...base, choix, bonne: choix.indexOf(bonne) };
}

/* ---------- Fabrication des questions ---------- */

export function annee(c: Carte): number | null {
  const m = texte(c, "dates").match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
  return m ? Number(m[1]) : null;
}

const ENONCE_ANNEE: Record<string, (t: string) => string> = {
  personnalite: (t) => `En quelle année naît ${t} ?`,
  evenement: (t) => `En quelle année : « ${t} » ?`,
  mesure: (t) => `En quelle année est obtenue cette mesure : « ${t} » ?`,
  livre: (t) => `En quelle année paraît « ${t} » ?`,
  chant: (t) => `En quelle année est écrit « ${t} » ?`,
};

function questionAnnee(c: Carte, autres: Carte[], hasard: Hasard): Question | null {
  const a = annee(c);
  const enonce = ENONCE_ANNEE[c.fam];
  if (!a || !enonce) return null;
  const voisines = [1, -1, 2, -2, 3, -3, 5, -5].map((d) => String(a + d));
  const autresAnnees = autres.map(annee).filter((x): x is number => !!x && x !== a).map(String);
  // Les années des autres cartes d'abord (plus intéressant), puis des années voisines.
  const fausses = [...melanger(uniques(autresAnnees), hasard).slice(0, 2), ...melanger(voisines, hasard)];
  return assembler({ carteId: c.id, type: "annee", enonce: enonce(c.title), explication: texte(c, "dates") }, String(a), fausses, hasard);
}

const PARTICULES = new Set(["de", "du", "des", "d'", "d’", "la", "le", "von", "van"]);

/**
 * Le texte ressemble-t-il à un nom de personne (« Karl Marx », « Jean-Baptiste Clément ») ?
 * Écarte les descriptions comme « Premier couplet » ou « Plaque du mur ».
 */
export function estUnNom(s: string): boolean {
  const mots = s.trim().split(/\s+/);
  if (!mots.length || mots.length > 4) return false;
  return mots.every((m) => PARTICULES.has(m) || /^\p{Lu}/u.test(m)) && mots.some((m) => /^\p{Lu}/u.test(m));
}

function questionCitation(c: Carte, autres: Carte[], hasard: Hasard): Question | null {
  const phrase = texte(c, "phrase"), auteur = texte(c, "phraseSrc");
  const nom = auteur.split(",")[0].trim();
  if (!phrase || !estUnNom(nom)) return null;
  const fausses = [
    ...autres.map((x) => texte(x, "phraseSrc").split(",")[0].trim()).filter(estUnNom),
    ...autres.filter((x) => x.fam === "personnalite").map((x) => x.title),
  ];
  return assembler({ carteId: c.id, type: "citation", enonce: "Qui a dit ou écrit cette phrase ?", extrait: `« ${phrase} »`, explication: auteur }, nom, fausses, hasard);
}

/** Masque le titre (et ses mots importants) dans un texte. */
export function masquer(t: string, titre: string): string {
  let r = t;
  const mots = titre.split(/[\s'’]+/).filter((m) => m.length > 3);
  for (const m of [titre, ...mots]) {
    const motif = m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    r = r.replace(new RegExp(motif, "gi"), "▬▬▬");
  }
  return r;
}

function questionCarte(c: Carte, autres: Carte[], hasard: Hasard): Question | null {
  const fait = texte(c, "fait");
  if (fait.length < 60) return null;
  const extrait = masquer(fait, c.title);
  if (extrait.toLowerCase().includes(c.title.toLowerCase())) return null;
  const memeFamille = autres.filter((x) => x.fam === c.fam).map((x) => x.title);
  const fausses = [...melanger(memeFamille, hasard), ...melanger(autres.map((x) => x.title), hasard)];
  return assembler({ carteId: c.id, type: "carte", enonce: "De quelle carte vient ce texte ?", extrait }, c.title, fausses, hasard);
}

function questionRole(c: Carte, autres: Carte[], hasard: Hasard): Question | null {
  const role = texte(c, "role");
  if (c.fam !== "personnalite" || !role) return null;
  const fausses = autres.filter((x) => x.fam === "personnalite").map((x) => texte(x, "role"));
  return assembler({ carteId: c.id, type: "role", enonce: `Qui était ${c.title} ?` }, role, fausses, hasard);
}

function questionLien(c: Carte, autres: Carte[], hasard: Hasard): Question | null {
  const liees = autres.filter((x) => c.links?.includes(x.id) || x.links?.includes(c.id));
  if (!liees.length) return null;
  const bonne = liees[Math.floor(hasard() * liees.length)];
  const fausses = autres.filter((x) => !liees.includes(x)).map((x) => x.title);
  return assembler({ carteId: c.id, type: "lien", enonce: `Quelle carte est liée à « ${c.title} » ?`, explication: `« ${c.title} » et « ${bonne.title} » sont liées.` }, bonne.title, fausses, hasard);
}

function questionsEcrites(c: Carte, hasard: Hasard): Question[] {
  const liste = Array.isArray(c.questions) ? (c.questions as QuestionEcrite[]) : [];
  return liste
    .map((q) => assembler({ carteId: c.id, type: "ecrite", enonce: q.q, explication: q.explication }, q.bonne, q.fausses, hasard))
    .filter((q): q is Question => q !== null);
}

/**
 * Une question sur une carte. Les questions écrites passent en priorité ;
 * sinon une question fabriquée, d'un type tiré au hasard parmi ceux possibles.
 * @param autres les autres cartes possédées, pour les mauvaises réponses
 */
export function questionPour(c: Carte, autres: Carte[], hasard: Hasard): Question | null {
  const ecrites = questionsEcrites(c, hasard);
  if (ecrites.length) return ecrites[Math.floor(hasard() * ecrites.length)];
  const fabriquees = [questionAnnee, questionCitation, questionCarte, questionRole, questionLien]
    .map((f) => f(c, autres, hasard))
    .filter((q): q is Question => q !== null);
  return fabriquees.length ? fabriquees[Math.floor(hasard() * fabriquees.length)] : null;
}

/* ---------- Mémoire par carte (boîtes de Leitner) ---------- */

export interface Souvenir {
  carteId: string;
  /** De 1 (à revoir vite) à 5 (bien su). */
  boite: number;
  /** Dernière fois que la carte a été interrogée (AAAA-MM-JJ). */
  dernier: string;
}

/** Nombre de jours avant de revoir une carte, selon sa boîte. */
export const INTERVALLES = [0, 1, 2, 4, 8, 16];

export function joursEntre(a: string, b: string): number {
  const j = (d: string) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
  return Math.round((j(b) - j(a)) / 86_400_000);
}

export function apresReponse(s: Souvenir | undefined, carteId: string, juste: boolean, date: string): Souvenir {
  const boite = juste ? Math.min(5, (s?.boite ?? 1) + 1) : 1;
  return { carteId, boite, dernier: date };
}

export const QUESTIONS_PAR_JOUR = 3;
export const CARTES_MIN_QUIZ = 4;

/**
 * Les questions du jour : d'abord les cartes « à revoir » (les moins sues en premier),
 * puis les autres. Toujours les mêmes pour une même date et une même graine.
 */
export function questionsDuJour(possedees: Carte[], memoire: Record<string, Souvenir>, date: string, graine: string): Question[] {
  if (possedees.length < CARTES_MIN_QUIZ) return [];
  const hasard = hasardDepuis(graine + date);
  const aRevoir = (c: Carte) => {
    const s = memoire[c.id];
    return !s || joursEntre(s.dernier, date) >= INTERVALLES[s.boite];
  };
  const ordre = melanger(possedees, hasard).sort((a, b) => {
    const ra = aRevoir(a) ? 0 : 1, rb = aRevoir(b) ? 0 : 1;
    if (ra !== rb) return ra - rb;
    return (memoire[a.id]?.boite ?? 0) - (memoire[b.id]?.boite ?? 0);
  });
  const questions: Question[] = [];
  for (const c of ordre) {
    if (questions.length >= QUESTIONS_PAR_JOUR) break;
    const q = questionPour(c, possedees.filter((x) => x.id !== c.id), hasard);
    if (q) questions.push(q);
  }
  return questions;
}
