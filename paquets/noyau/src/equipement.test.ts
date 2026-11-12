import { describe, expect, it } from "vitest";
import { avantNiveauSuivant, bonusDePoints, EMPLACEMENTS, equipementValide, niveauObjet, objetDuPouvoir, objetsDebloques, OBJETS } from "./equipement";
import { ennemiPour, pointsDeBataille, retirerUneMauvaise, type Ennemi } from "./bataille";
import { hasardDepuis } from "./quiz";
import type { Carte } from "./formats";

describe("équipement", () => {
  it("chaque famille débloque 3 objets, à 1, 3 et 6 cartes", () => {
    for (const f of ["personnalite", "evenement", "lieu", "mesure", "concept", "courant", "livre", "chant"]) {
      expect(OBJETS.filter((x) => x.famille === f).map((x) => x.palier).sort((a, b) => a - b), f).toEqual([1, 3, 6]);
    }
  });
  it("chaque emplacement a au moins deux objets possibles", () => {
    for (const e of EMPLACEMENTS) expect(OBJETS.filter((x) => x.emplacement === e.id).length, e.id).toBeGreaterThanOrEqual(2);
  });
  it("niveaux de famille", () => {
    expect([0, 1, 2, 3, 5, 6, 30].map(niveauObjet)).toEqual([0, 1, 1, 2, 2, 3, 3]);
    expect(avantNiveauSuivant(4)).toBe(2);
    expect(avantNiveauSuivant(6)).toBeNull();
  });
  it("objets débloqués par la collection", () => {
    const ids = objetsDebloques({ chant: 1, evenement: 3 }).map((x) => x.id);
    expect(ids.sort()).toEqual(["banderole", "pancarte", "porte-voix"]);
  });
  it("équipement : remplit les emplacements jamais choisis, garde les choix, respecte un emplacement vidé exprès", () => {
    const d = objetsDebloques({ chant: 1, evenement: 3, livre: 1 });
    const e = equipementValide({}, d);
    expect(e["main-droite"]).toBe("porte-voix");
    expect(e["main-gauche"]).toBe("pancarte"); // le premier débloqué pour cet emplacement
    expect(e.dos).toBe("banderole");
    expect(e.tete).toBeUndefined();
    const choisi = equipementValide({ "main-gauche": "livre", dos: null }, d);
    expect(choisi["main-gauche"]).toBe("livre");
    expect(choisi.dos).toBeNull();
    // un objet qui n'est plus débloqué, ou mis au mauvais emplacement, est remplacé
    expect(equipementValide({ tete: "bonnet-phrygien", col: "livre" }, d).tete).toBeUndefined();
  });
  it("les pouvoirs ne valent que pour les objets portés ; les autres rapportent des points", () => {
    expect(objetDuPouvoir({ "main-droite": "porte-voix" }, "retirer")!.id).toBe("porte-voix");
    expect(objetDuPouvoir({ "main-droite": "drapeau" }, "retirer")).toBeNull();
    expect(bonusDePoints({ "main-droite": "porte-voix", tete: "casquette", col: "foulard-rouge" })).toBe(2);
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
