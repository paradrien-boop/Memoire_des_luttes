import { describe, expect, it } from "vitest";
import { exporterPack, lirePack } from "./packs";
import type { Famille } from "./formats";

const familles: Record<string, Famille> = {
  evenement: { libelle: "Événement", reserveeAuCollectif: false, champs: [] },
  chant: { libelle: "Chant", reserveeAuCollectif: false, champs: [] },
  manif: { libelle: "Carte d'événement", reserveeAuCollectif: true, champs: [] },
};

describe("exporter puis lire un pack", () => {
  it("retrouve les cartes", () => {
    const texte = exporterPack("Mon pack", [{ id: "perso-1", fam: "chant", rar: "rare", title: "Bella Ciao", fait: "Chant de résistance." }]);
    const lu = lirePack(texte, familles, "imp");
    expect(lu.nom).toBe("Mon pack");
    expect(lu.cartes[0]).toMatchObject({ id: "imp-0", fam: "chant", rar: "rare", title: "Bella Ciao", fait: "Chant de résistance." });
  });
});

describe("lirePack refuse ou nettoie ce qui est douteux", () => {
  it("refuse un texte qui n'est pas du JSON", () => {
    expect(() => lirePack("bonjour", familles, "imp")).toThrow("pas un pack valide");
  });

  it("refuse un pack sans carte lisible", () => {
    expect(() => lirePack('{"cartes":[{"fam":"chant"}]}', familles, "imp")).toThrow("aucune carte");
  });

  it("interdit de se faire passer pour une carte d'événement ou une carte signée", () => {
    const c = lirePack('{"cartes":[{"title":"Faux","fam":"manif","rar":"evenement","statut":"signee"}]}', familles, "imp").cartes[0];
    expect(c.fam).toBe("evenement");
    expect(c.rar).toBe("base");
    expect(c.statut).toBeUndefined();
  });

  it("ne garde que les images intégrées", () => {
    const lire = (img: string) => lirePack(JSON.stringify({ cartes: [{ title: "x", img }] }), familles, "imp").cartes[0].img;
    expect(lire("https://exemple.org/traceur.png")).toBeUndefined();
    expect(lire("data:image/jpeg;base64,AAAA")).toBe("data:image/jpeg;base64,AAAA");
  });

  it("ignore les valeurs qui ne sont pas du texte", () => {
    const c = lirePack('{"cartes":[{"title":"x","fait":{"piege":1}}]}', familles, "imp").cartes[0];
    expect(c.fait).toBeUndefined();
  });
});
