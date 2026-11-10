import { describe, expect, it } from "vitest";
import { brouillon, couper, dateFr, entites, type EntiteWikidata } from "./wikidata";

// Exemples au format des réponses réelles (résumé REST de Wikipédia, entité Wikidata), réduits à l'utile.
const resume = {
  title: "Louise Michel",
  extract: "Louise Michel, née le 29 mai 1830 à Vroncourt-la-Côte et morte le 9 janvier 1905 à Marseille, est une institutrice, écrivaine et militante anarchiste française. Figure majeure de la Commune de Paris, elle est déportée en Nouvelle-Calédonie. Elle y soutient la révolte kanak de 1878.",
  wikibase_item: "Q216092",
  content_urls: { desktop: { page: "https://fr.wikipedia.org/wiki/Louise_Michel" } },
};
const temps = (time: string, precision = 11) => ({ mainsnak: { datavalue: { value: { time, precision } } } });
const entite = (id: string) => ({ mainsnak: { datavalue: { value: { id } } } });
const louise: EntiteWikidata = { id: "Q216092", claims: { P569: [temps("+1830-05-29T00:00:00Z")], P570: [temps("+1905-01-09T00:00:00Z")], P106: [entite("Q37226"), entite("Q36180"), entite("Q1930187")] } };

describe("brouillons depuis Wikipédia et Wikidata", () => {
  it("dates en français selon la précision", () => {
    expect(dateFr({ time: "+1871-03-18T00:00:00Z", precision: 11 })).toBe("18 mars 1871");
    expect(dateFr({ time: "+1871-05-01T00:00:00Z", precision: 11 })).toBe("1er mai 1871");
    expect(dateFr({ time: "+1871-05-00T00:00:00Z", precision: 10 })).toBe("mai 1871");
    expect(dateFr({ time: "+1871-00-00T00:00:00Z", precision: 9 })).toBe("1871");
  });

  it("coupe le texte à une phrase complète", () => {
    expect(couper("Une phrase. Une autre phrase plus longue.", 20)).toBe("Une phrase.");
    expect(couper("Court.", 100)).toBe("Court.");
  });

  it("brouillon d'une personnalité : dates, rôle, texte, sources, statut « proposée »", () => {
    const c = brouillon("louise-michel", "personnalite", resume, louise, { Q37226: "enseignante", Q36180: "écrivaine" });
    expect(entites(louise, "P106")).toEqual(["Q37226", "Q36180", "Q1930187"]);
    expect(c).toMatchObject({ id: "louise-michel", fam: "personnalite", title: "Louise Michel", dates: "1830 – 1905", role: "enseignante, écrivaine", pourquoi: "", statut: "proposee" });
    expect(c.fait).toMatch(/^Louise Michel, née le 29 mai 1830/);
    expect(String(c.fait).length).toBeLessThanOrEqual(560);
    expect(c.src).toContain("https://fr.wikipedia.org/wiki/Louise_Michel");
    expect(c.src).toContain("Wikidata Q216092");
  });

  it("brouillon d'un événement daté par début et fin", () => {
    const e: EntiteWikidata = { id: "Q1", claims: { P580: [temps("+1871-03-18T00:00:00Z")], P582: [temps("+1871-05-28T00:00:00Z")], P276: [entite("Q90")] } };
    const c = brouillon("commune", "evenement", { ...resume, title: "Commune de Paris" }, e, { Q90: "Paris" });
    expect(c).toMatchObject({ dates: "18 mars 1871 – 28 mai 1871", lieu: "Paris" });
  });

  it("sans Wikidata, garde au moins le texte et la source", () => {
    const c = brouillon("x", "concept", resume, null, {});
    expect(c.dates).toBeUndefined();
    expect(c.fait).toBeTruthy();
  });
});
