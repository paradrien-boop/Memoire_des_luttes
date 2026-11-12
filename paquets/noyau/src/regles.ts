// Règles du jeu. Fonctions pures : le hasard est passé en paramètre pour pouvoir tester.
import type { Carte, Rarete } from "./formats";

export const REGLES = {
  /** Minutes de manif pour gagner un booster. */
  minutesParBooster: 45,
  /** Boosters gagnés au maximum par jour avec le compteur. */
  boostersMaxParJour: 5,
  /** Minutes de manif pour valider un jour. */
  minutesPourValiderJour: 60,
  /** Après ce nombre de boosters sans carte rare, le suivant en contient forcément une. */
  garantieApres: 3,
  cartesParBooster: 3,
  /** Cartes gagnées au plus par jour, tous boosters confondus (réglable dans data/regles.json). */
  cartesMaxParJour: 9,
  /** Probabilités par carte. */
  probabilites: { legendaire: 0.06, rare: 0.26 },
} as const;

export type Hasard = () => number;

export function tirerRarete(hasard: Hasard): Rarete {
  const r = hasard();
  if (r < REGLES.probabilites.legendaire) return "legendaire";
  if (r < REGLES.probabilites.legendaire + REGLES.probabilites.rare) return "rare";
  return "base";
}

export interface ResultatBooster {
  cartes: Carte[];
  /** Nouvelle valeur du compteur de boosters sans carte rare. */
  sansRare: number;
}

/**
 * Tire un booster parmi les cartes officielles.
 * @param minimum rareté garantie pour la dernière carte (codes de stand)
 */
export function tirerBooster(cartes: Carte[], sansRare: number, hasard: Hasard, minimum?: Rarete): ResultatBooster {
  const tirage: Carte[] = [];
  for (let i = 0; i < REGLES.cartesParBooster; i++) {
    let rar = tirerRarete(hasard);
    const derniere = i === REGLES.cartesParBooster - 1;
    if (derniere) {
      if (minimum === "legendaire") rar = "legendaire";
      else if ((minimum === "rare" || sansRare >= REGLES.garantieApres) && rar === "base") rar = "rare";
    }
    let possibles = cartes.filter(c => c.rar === rar);
    if (!possibles.length) possibles = cartes; // pack sans carte de cette rareté
    tirage.push(possibles[Math.floor(hasard() * possibles.length)]);
  }
  const aDuRare = tirage.some(c => c.rar !== "base");
  return { cartes: tirage, sansRare: aDuRare ? 0 : sansRare + 1 };
}

/** Nombre total de boosters mérités pour une durée de manif (avant plafond du jour). */
export function boostersPourDuree(ms: number): number {
  return Math.floor(ms / (REGLES.minutesParBooster * 60_000));
}

/** Peut-on encore ouvrir un booster aujourd'hui ? (dons de camarades et cartes d'événement ne comptent pas) */
export function peutOuvrirBooster(cartesAujourdhui: number, maxParJour: number = REGLES.cartesMaxParJour): boolean {
  return cartesAujourdhui + REGLES.cartesParBooster <= maxParJour;
}
