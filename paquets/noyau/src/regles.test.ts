import { describe, expect, it } from "vitest";
import { boostersPourDuree, REGLES, tirerBooster, tirerRarete } from "./regles";
import type { Carte } from "./formats";

const carte = (id: string, rar: Carte["rar"]): Carte => ({ id, fam: "evenement", rar, title: id });
const cartes = [carte("b1", "base"), carte("b2", "base"), carte("r1", "rare"), carte("l1", "legendaire")];
/** Un « hasard » qui rejoue une liste de valeurs. */
const suite = (...v: number[]) => { let i = 0; return () => v[i++ % v.length]; };

describe("tirerRarete", () => {
  it("respecte les seuils de probabilité", () => {
    expect(tirerRarete(() => 0.01)).toBe("legendaire");
    expect(tirerRarete(() => 0.1)).toBe("rare");
    expect(tirerRarete(() => 0.9)).toBe("base");
  });
});

describe("tirerBooster", () => {
  it("donne trois cartes", () => {
    expect(tirerBooster(cartes, 0, Math.random).cartes).toHaveLength(REGLES.cartesParBooster);
  });

  it("augmente le compteur quand il n'y a que des cartes de base", () => {
    const r = tirerBooster(cartes, 1, suite(0.9));
    expect(r.cartes.every(c => c.rar === "base")).toBe(true);
    expect(r.sansRare).toBe(2);
  });

  it("garantit une carte rare après trois boosters sans rare", () => {
    const r = tirerBooster(cartes, REGLES.garantieApres, suite(0.9));
    expect(r.cartes.at(-1)!.rar).toBe("rare");
    expect(r.sansRare).toBe(0);
  });

  it("garantit une légendaire avec un code de stand légendaire", () => {
    expect(tirerBooster(cartes, 0, suite(0.9), "legendaire").cartes.at(-1)!.rar).toBe("legendaire");
  });
});

describe("boostersPourDuree", () => {
  it("donne un booster toutes les 45 minutes", () => {
    expect(boostersPourDuree(44 * 60_000)).toBe(0);
    expect(boostersPourDuree(45 * 60_000)).toBe(1);
    expect(boostersPourDuree(100 * 60_000)).toBe(2);
  });
});
