import { describe, expect, it } from "vitest";
import { avantNiveauSuivant, bonusDePoints, equipement, niveauObjet, OBJETS, utilisationsParJour } from "./equipement";
import { ennemiPour, pointsDeBataille, retirerUneMauvaise, type Ennemi } from "./bataille";
import { hasardDepuis } from "./quiz";
import type { Carte } from "./formats";

describe("équipement", () => {
  it("chaque famille donne un objet", () => {
    for (const f of ["personnalite", "evenement", "lieu", "mesure", "concept", "courant", "livre", "chant"]) expect(OBJETS[f]).toBeTruthy();
  });
  it("l'objet se gagne à la première carte de la famille, puis s'améliore à 3 et 6 cartes", () => {
    expect([0, 1, 2, 3, 5, 6, 30].map(niveauObjet)).toEqual([0, 1, 1, 2, 2, 3, 3]);
    expect(avantNiveauSuivant(4)).toBe(2);
    expect(avantNiveauSuivant(6)).toBeNull();
  });
  it("niveaux de tous les objets, pouvoirs et bonus", () => {
    const n = equipement({ chant: 1, personnalite: 3, mesure: 6 });
    expect(n.chant).toBe(1);
    expect(n.livre).toBe(0);
    expect(utilisationsParJour(n.chant)).toBe(1);
    expect(bonusDePoints(n)).toBe(2 + 3); // foulard niveau 2, casquette niveau 3 ; le porte-voix a un pouvoir, pas de bonus
  });
});

describe("batailles", () => {
  const e = (id: string, familles: string[], chef?: string): Ennemi => ({ id, nom: id, epoque: "1871", description: "", replique: "", defaite: "", dessin: "soldat", familles, ...(chef ? { chef: { serie: chef } } : {}) });
  const ennemis = [e("versaillais", ["evenement"]), e("censeur", ["chant", "livre"]), e("general", [], "72j")];
  const carte = (fam: string, serie = "72j"): Carte => ({ id: "x", fam, rar: "base", title: "x", serie });

  it("l'adversaire attaque sur la famille de la carte", () => {
    expect(ennemiPour(carte("chant"), ennemis, hasardDepuis("a"))!.id).toBe("censeur");
    expect(ennemiPour(carte("evenement"), ennemis, hasardDepuis("a"))!.id).toBe("versaillais");
  });
  it("sinon n'importe quel adversaire ordinaire, jamais un chef par hasard", () => {
    for (let i = 0; i < 20; i++) expect(ennemiPour(carte("lieu"), ennemis, hasardDepuis("s" + i))!.chef).toBeUndefined();
  });
  it("le chef n'arrive qu'en dernière question, une fois sa série complète", () => {
    expect(ennemiPour(carte("evenement"), ennemis, hasardDepuis("a"), ["72j"], true)!.id).toBe("general");
    expect(ennemiPour(carte("evenement"), ennemis, hasardDepuis("a"), [], true)!.id).toBe("versaillais");
    expect(ennemiPour(carte("evenement"), ennemis, hasardDepuis("a"), ["72j"], false)!.id).toBe("versaillais");
  });
  it("points : bonus des objets, double contre un chef", () => {
    expect(pointsDeBataille(10, 3, false)).toBe(13);
    expect(pointsDeBataille(10, 3, true)).toBe(26);
  });
  it("le porte-voix retire une mauvaise réponse, mais en laisse toujours une", () => {
    const r = retirerUneMauvaise(["a", "b", "c", "d"], 2, [], hasardDepuis("p"))!;
    expect(r).not.toBe(2);
    expect(retirerUneMauvaise(["a", "b", "c", "d"], 2, [0, 1], hasardDepuis("p"))).toBeNull();
  });
});
