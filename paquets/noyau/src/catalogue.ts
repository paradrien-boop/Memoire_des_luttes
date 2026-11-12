// Prépare les données pour le jeu : séries dans l'ordre, cartes des packs de confiance, événements.
import type { Carte, CarteEvenement, Donnees, Pack, Serie } from "./formats";
import type { Ennemi } from "./bataille";

export interface Origine {
  type: "officiel" | "local";
  packId: string;
  collectif?: { id: string; nom: string };
}

export interface Catalogue {
  familles: Donnees["familles"];
  series: Serie[];
  /** Cartes qui tombent dans les boosters (packs officiels et locaux de confiance), dans l'ordre des séries. */
  officielles: Carte[];
  parId: Record<string, Carte>;
  origine: Record<string, Origine>;
  evenements: Record<string, CarteEvenement>;
  packs: Pack[];
  /** Les adversaires des batailles du quiz, de tous les packs de confiance. */
  ennemis: Ennemi[];
}

/**
 * @param installes packs reçus après l'installation de l'app (officiels vérifiés, ou locaux acceptés).
 *   Un pack installé remplace le pack intégré à l'app qui a le même identifiant (mise à jour).
 */
export function preparerCatalogue(d: Donnees, installes: Pack[] = []): Catalogue {
  const ids = new Set(installes.map((p) => p.id));
  const packs = [...d.packs.filter((p) => p.type === "officiel" && !ids.has(p.id)), ...installes];
  const parId: Record<string, Carte> = {};
  const origine: Record<string, Origine> = {};
  for (const p of packs) for (const c of p.cartes) {
    parId[c.id] = c;
    origine[c.id] = { type: p.type, packId: p.id, ...(p.collectif ? { collectif: p.collectif } : {}) };
  }
  const series = packs.flatMap((p) => p.series);
  const officielles = series.flatMap((s) => s.cartes.filter((id) => parId[id]).map((id) => ({ ...parId[id], serie: s.id })));
  const evenements = Object.fromEntries([...d.evenements, ...packs.filter((p) => p.type === "officiel").flatMap((p) => p.evenements ?? [])].map((e) => [e.id, e]));
  const ennemis = packs.flatMap((p) => p.ennemis ?? []);
  return { familles: d.familles, series, officielles, parId, origine, evenements, packs, ennemis };
}
