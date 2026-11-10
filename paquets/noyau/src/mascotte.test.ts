import { describe, expect, it } from "vitest";
import { ajouterFragment, dort, niveau, pointsPourReponse, stade, versStadeSuivant } from "./mascotte";
import { joursEntre } from "./quiz";

describe("le chat", () => {
  it("grandit par paliers de points", () => {
    expect(stade(0)).toBe(0);
    expect(stade(29)).toBe(0);
    expect(stade(30)).toBe(1);
    expect(stade(499)).toBe(3);
    expect(stade(5000)).toBe(4);
  });
  it("indique le chemin vers le stade suivant", () => {
    expect(versStadeSuivant(15)).toBeCloseTo(0.5);
    expect(versStadeSuivant(9999)).toBe(1);
  });
  it("dort après plus de 2 jours d'absence", () => {
    expect(dort("2027-03-15", "2027-03-17", joursEntre)).toBe(false);
    expect(dort("2027-03-14", "2027-03-17", joursEntre)).toBe(true);
    expect(dort(null, "2027-03-17", joursEntre)).toBe(false);
  });
});

describe("le quartier et les récompenses", () => {
  it("un élément passe par trois niveaux", () => {
    expect([0, 1, 3, 4, 9, 10].map(niveau)).toEqual([0, 1, 1, 2, 2, 3]);
  });
  it("double les points un jour de manif", () => {
    expect(pointsPourReponse(true, false)).toBe(10);
    expect(pointsPourReponse(true, true)).toBe(20);
    expect(pointsPourReponse(false, true)).toBe(0);
  });
  it("5 fragments font un booster", () => {
    expect(ajouterFragment(3)).toEqual({ fragments: 4, boosters: 0 });
    expect(ajouterFragment(4)).toEqual({ fragments: 0, boosters: 1 });
  });
});
