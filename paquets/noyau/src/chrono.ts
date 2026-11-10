// Compteur de manif. Fonctions pures : l'heure est passée en paramètre.
import { boostersPourDuree, REGLES } from "./regles";

export interface Session {
  debut: number;
  /** Dernière fois que le compteur a été mis à jour. */
  dernier: number;
  /** Temps de manif compté, en millisecondes (accéléré en mode démo). */
  effectif: number;
  /** Boosters déjà comptés pour cette session, plafond compris. */
  credites: number;
}

export interface Journee {
  date: string;
  gagnes: number;
}

export interface EtatChrono {
  session: Session | null;
  journee: Journee;
  jours: string[];
}

export interface ResultatTic {
  etat: EtatChrono;
  nouveauxBoosters: number;
  jourValide: boolean;
}

/** Écart maximal compté d'un coup : évite qu'un téléphone resté éteint compte des jours entiers. */
export const ECART_MAX = 4 * 3600_000;

export function demarrer(maintenant: number): Session {
  return { debut: maintenant, dernier: maintenant, effectif: 0, credites: 0 };
}

/**
 * Fait avancer le compteur jusqu'à « maintenant ».
 * @param vitesse 1 en temps normal, 60 en mode démo
 * @param date date du jour au format AAAA-MM-JJ
 */
export function tic(etat: EtatChrono, maintenant: number, vitesse: number, date: string): ResultatTic {
  if (!etat.session) return { etat, nouveauxBoosters: 0, jourValide: false };
  const ecart = Math.min(Math.max(0, maintenant - etat.session.dernier), ECART_MAX);
  const session: Session = { ...etat.session, dernier: maintenant, effectif: etat.session.effectif + ecart * vitesse };
  const journee: Journee = etat.journee.date === date ? { ...etat.journee } : { date, gagnes: 0 };

  let nouveauxBoosters = 0;
  const cible = boostersPourDuree(session.effectif);
  while (session.credites < cible) {
    session.credites++;
    if (journee.gagnes < REGLES.boostersMaxParJour) { journee.gagnes++; nouveauxBoosters++; }
  }

  let jours = etat.jours;
  let jourValide = false;
  if (session.effectif >= REGLES.minutesPourValiderJour * 60_000 && !jours.includes(date)) {
    jours = [...jours, date];
    jourValide = true;
  }
  return { etat: { session, journee, jours }, nouveauxBoosters, jourValide };
}

/** Part du booster en cours déjà accomplie, entre 0 et 1. */
export function progression(session: Session | null): number {
  if (!session) return 0;
  const pas = REGLES.minutesParBooster * 60_000;
  return (session.effectif % pas) / pas;
}
