import { describe, expect, it } from "vitest";
import { demarrer, ECART_MAX, progression, tic, type EtatChrono } from "./chrono";
import { REGLES } from "./regles";

const MIN = 60_000;
const depart = (t = 0): EtatChrono => ({ session: demarrer(t), journee: { date: "2027-03-18", gagnes: 0 }, jours: [] });

describe("tic", () => {
  it("ne fait rien sans manif en cours", () => {
    const etat: EtatChrono = { session: null, journee: { date: "", gagnes: 0 }, jours: [] };
    expect(tic(etat, 1e9, 1, "2027-03-18").nouveauxBoosters).toBe(0);
  });

  it("donne un booster après 45 minutes", () => {
    expect(tic(depart(), 44 * MIN, 1, "2027-03-18").nouveauxBoosters).toBe(0);
    expect(tic(depart(), 45 * MIN, 1, "2027-03-18").nouveauxBoosters).toBe(1);
  });

  it("ne redonne pas un booster déjà compté", () => {
    const a = tic(depart(), 50 * MIN, 1, "2027-03-18");
    expect(tic(a.etat, 55 * MIN, 1, "2027-03-18").nouveauxBoosters).toBe(0);
  });

  it("plafonne à 5 boosters par jour", () => {
    let r = tic(depart(), 0, 1, "2027-03-18");
    for (let t = 1; t <= 10; t++) r = tic(r.etat, t * 45 * MIN, 1, "2027-03-18");
    expect(r.etat.journee.gagnes).toBe(REGLES.boostersMaxParJour);
  });

  it("valide le jour après une heure, une seule fois", () => {
    const a = tic(depart(), 61 * MIN, 1, "2027-03-18");
    expect(a.jourValide).toBe(true);
    const b = tic(a.etat, 70 * MIN, 1, "2027-03-18");
    expect(b.jourValide).toBe(false);
    expect(b.etat.jours).toEqual(["2027-03-18"]);
  });

  it("accélère 60 fois en mode démo", () => {
    expect(tic(depart(), 45_000, 60, "2027-03-18").nouveauxBoosters).toBe(1);
  });

  it("ne compte pas plus de 4 heures d'un coup", () => {
    expect(tic(depart(), 48 * 3600_000, 1, "2027-03-18").etat.session!.effectif).toBe(ECART_MAX);
  });

  it("remet le plafond à zéro un autre jour", () => {
    const a = tic({ ...depart(), journee: { date: "2027-03-17", gagnes: 5 } }, 45 * MIN, 1, "2027-03-18");
    expect(a.nouveauxBoosters).toBe(1);
  });
});

describe("progression", () => {
  it("indique la part du booster en cours", () => {
    expect(progression({ ...demarrer(0), effectif: 22.5 * MIN })).toBeCloseTo(0.5);
    expect(progression(null)).toBe(0);
  });
});
