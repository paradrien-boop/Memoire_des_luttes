// Prépare les données brutes pour le jeu : séries dans l'ordre, cartes officielles, événements.
import type { Carte, CarteEvenement, Donnees, Serie } from "./formats";

export interface Catalogue {
  familles: Donnees["familles"];
  series: Serie[];
  /** Cartes officielles, dans l'ordre des séries. Seules celles-ci tombent dans les boosters. */
  officielles: Carte[];
  parId: Record<string, Carte>;
  evenements: Record<string, CarteEvenement>;
}

export function preparerCatalogue(d: Donnees): Catalogue {
  const packs = d.packs.filter(p => p.type === "officiel");
  const parId: Record<string, Carte> = {};
  for (const p of packs) for (const c of p.cartes) parId[c.id] = c;
  const series = packs.flatMap(p => p.series);
  const officielles = series.flatMap(s => s.cartes.filter(id => parId[id]).map(id => ({ ...parId[id], serie: s.id })));
  const evenements = Object.fromEntries(d.evenements.map(e => [e.id, e]));
  return { familles: d.familles, series, officielles, parId, evenements };
}
