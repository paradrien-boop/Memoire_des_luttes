import { describe, expect, it } from "vitest";
import { join } from "node:path";
import { assembler } from "../../../scripts/assembler.mjs";
import { preparerCatalogue } from "./catalogue";
import { apresReponse, annee, estUnNom, hasardDepuis, joursEntre, masquer, questionPour, questionsDuJour, type Question, type Souvenir } from "./quiz";
import type { Carte } from "./formats";

const cartes = preparerCatalogue(assembler(join(import.meta.dirname, "../../.."))).officielles;

function verifier(q: Question) {
  expect(q.choix).toHaveLength(4);
  expect(new Set(q.choix.map((c) => c.toLowerCase())).size).toBe(4);
  expect(q.bonne).toBeGreaterThanOrEqual(0);
  expect(q.bonne).toBeLessThan(4);
}

describe("questions fabriquées à partir des vraies cartes", () => {
  it("chaque carte du pack de départ donne au moins une question valide", () => {
    for (const c of cartes) {
      const q = questionPour(c, cartes.filter((x) => x.id !== c.id), hasardDepuis(c.id));
      expect(q, c.id).not.toBeNull();
      verifier(q!);
    }
  });

  it("toutes les questions possibles sont valides, sur beaucoup de tirages", () => {
    for (let i = 0; i < 300; i++) {
      const c = cartes[i % cartes.length];
      const q = questionPour(c, cartes.filter((x) => x.id !== c.id), hasardDepuis("t" + i));
      if (q) verifier(q);
    }
  });

  it("une question « de quelle carte » ne laisse jamais voir le titre", () => {
    for (let i = 0; i < 300; i++) {
      const c = cartes[i % cartes.length];
      const q = questionPour(c, cartes.filter((x) => x.id !== c.id), hasardDepuis("m" + i));
      if (q?.type === "carte") expect(q.extrait!.toLowerCase()).not.toContain(c.title.toLowerCase());
    }
  });
});

describe("questions écrites", () => {
  it("passent avant les questions fabriquées", () => {
    const c: Carte = { ...cartes[0], questions: [{ q: "Question écrite ?", bonne: "Oui", fausses: ["Non", "Peut-être", "Jamais"], explication: "Parce que." }] };
    const q = questionPour(c, cartes.slice(1), hasardDepuis("x"))!;
    expect(q.type).toBe("ecrite");
    expect(q.choix[q.bonne]).toBe("Oui");
  });
});

describe("outils", () => {
  it("reconnaît un nom de personne", () => {
    for (const n of ["Karl Marx", "Jean-Baptiste Clément", "Pierre-Joseph Proudhon", "Louise Michel", "Rosa Luxemburg"]) expect(estUnNom(n), n).toBe(true);
    for (const n of ["Expression de la fraternisation", "Plaque du mur", "Premier couplet", "Les grévistes de Lip"]) expect(estUnNom(n), n).toBe(false);
  });
  it("trouve l'année d'une carte", () => {
    expect(annee({ id: "a", fam: "evenement", rar: "base", title: "x", dates: "18 mars – 28 mai 1871" })).toBe(1871);
  });
  it("masque le titre et ses mots importants", () => {
    expect(masquer("Louise Michel est déportée. Michel revient.", "Louise Michel")).toBe("▬▬▬ est déportée. ▬▬▬ revient.");
  });
  it("compte les jours entre deux dates", () => {
    expect(joursEntre("2027-02-27", "2027-03-02")).toBe(3);
  });
});

describe("questions du jour", () => {
  it("donne 3 questions sur 3 cartes différentes", () => {
    const q = questionsDuJour(cartes, {}, "2027-03-18", "graine");
    expect(q).toHaveLength(3);
    expect(new Set(q.map((x) => x.carteId)).size).toBe(3);
  });

  it("sont les mêmes toute la journée, et changent le lendemain", () => {
    const a = questionsDuJour(cartes, {}, "2027-03-18", "graine");
    expect(questionsDuJour(cartes, {}, "2027-03-18", "graine")).toEqual(a);
    expect(questionsDuJour(cartes, {}, "2027-03-19", "graine")).not.toEqual(a);
  });

  it("ne commencent qu'à partir de 4 cartes", () => {
    expect(questionsDuJour(cartes.slice(0, 3), {}, "2027-03-18", "g")).toEqual([]);
  });

  it("interrogent d'abord les cartes ratées", () => {
    const memoire: Record<string, Souvenir> = {};
    for (const c of cartes) memoire[c.id] = { carteId: c.id, boite: 5, dernier: "2027-03-17" };
    memoire[cartes[3].id] = { carteId: cartes[3].id, boite: 1, dernier: "2027-03-17" };
    expect(questionsDuJour(cartes, memoire, "2027-03-18", "g")[0].carteId).toBe(cartes[3].id);
  });
});

describe("mémoire par carte", () => {
  it("monte d'une boîte si c'est juste, retourne en boîte 1 si c'est faux", () => {
    const s = apresReponse(undefined, "a", true, "2027-03-18");
    expect(s.boite).toBe(2);
    expect(apresReponse({ ...s, boite: 4 }, "a", false, "2027-03-19").boite).toBe(1);
    expect(apresReponse({ ...s, boite: 5 }, "a", true, "2027-03-19").boite).toBe(5);
  });
});
