import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { COMPTEURS_VIDES, compterManif, declarer, restantes, semaineDe, texteRecompense, type ConfigActions } from "./actions";

const config = JSON.parse(readFileSync(join(import.meta.dirname, "../../../data/actions.json"), "utf8")) as ConfigActions;
const action = (id: string) => config.actions.find((a) => a.id === id)!;

describe("actions militantes", () => {
  it("la configuration est cohérente", () => {
    const categories = new Set(config.categories.map((c) => c.id));
    for (const a of config.actions) expect(categories.has(a.categorie), a.id).toBe(true);
    expect(config.objectifs.choix).toContain(config.objectifs.defaut);
  });

  it("semaines ISO", () => {
    expect(semaineDe("2027-03-18")).toBe("2027-W11");
    expect(semaineDe("2027-01-01")).toBe("2026-W53");
    expect(semaineDe("2027-03-15")).toBe(semaineDe("2027-03-21"));
    expect(semaineDe("2027-03-21")).not.toBe(semaineDe("2027-03-22"));
  });

  it("récompense, puis plafond du jour", () => {
    const r = declarer(action("tractage"), COMPTEURS_VIDES, "2027-03-18", 7, config)!;
    expect(r.recompense).toEqual({ fragments: 2, boosters: 0 });
    expect(declarer(action("tractage"), r.compteurs, "2027-03-18", 7, config)).toBeNull();
    expect(restantes(action("tractage"), r.compteurs, "2027-03-19")).toBe(1);
  });

  it("plafond de la semaine, remis à zéro le lundi", () => {
    let c = COMPTEURS_VIDES;
    for (const d of ["2027-03-15", "2027-03-16"]) c = declarer(action("assemblee"), c, d, 7, config)!.compteurs;
    expect(declarer(action("assemblee"), c, "2027-03-21", 7, config)).toBeNull();
    expect(declarer(action("assemblee"), c, "2027-03-22", 7, config)).not.toBeNull();
  });

  it("« une seule fois » le reste, même des semaines plus tard", () => {
    const c = declarer(action("adhesion"), COMPTEURS_VIDES, "2027-03-18", 7, config)!.compteurs;
    expect(declarer(action("adhesion"), c, "2028-01-10", 7, config)).toBeNull();
  });

  it("l'objectif de la semaine rapporte son bonus une seule fois", () => {
    let c = COMPTEURS_VIDES;
    const a = declarer(action("tractage"), c, "2027-03-15", 2, config)!;
    expect(a.objectifAtteint).toBe(false);
    const b = declarer(action("lecture"), a.compteurs, "2027-03-15", 2, config)!;
    expect(b.objectifAtteint).toBe(true);
    expect(b.recompense.boosters).toBe(1);
    c = declarer(action("transmettre"), b.compteurs, "2027-03-15", 2, config)!.compteurs;
    expect(declarer(action("tractage"), c, "2027-03-16", 2, config)!.objectifAtteint).toBe(false);
  });

  it("un jour de manif compte pour l'objectif", () => {
    const m = compterManif(COMPTEURS_VIDES, "2027-03-18", 1, config);
    expect(m.objectifAtteint).toBe(true);
    expect(m.recompense.boosters).toBe(1);
  });

  it("aucun historique daté n'est gardé", () => {
    let c = COMPTEURS_VIDES;
    for (const d of ["2027-03-15", "2027-03-22", "2027-03-29"]) c = declarer(action("lecture"), c, d, 7, config)!.compteurs;
    expect(JSON.stringify(c)).not.toContain("2027-03-15");
    expect(JSON.stringify(c)).not.toContain("2027-03-22");
  });

  it("texte des récompenses", () => {
    expect(texteRecompense({ boosters: 1, fragments: 2 })).toBe("1 booster et 2 fragments");
    expect(texteRecompense({ fragments: 1 })).toBe("1 fragment");
  });
});
