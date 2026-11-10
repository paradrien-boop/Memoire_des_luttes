import { describe, expect, it } from "vitest";
import { clePublique, deleguer, empreinte, genererCles, signer, signerPack, verifier, verifierDelegation, verifierPack, type Confiance, type PackSignable } from "./signature";
import type { Carte } from "./formats";

const racine = genererCles();
const local = genererCles();
const conf = (x: Partial<Confiance> = {}): Confiance => ({ racines: [racine.publique], revoquees: [], date: "2027-03-18", ...x });
const carte = (id: string, rar: Carte["rar"] = "base"): Carte => ({ id, fam: "evenement", rar, title: "Carte " + id, fait: "Un fait." });
const pack = (cartes = [carte("a"), carte("b", "rare")]): PackSignable => ({ format: "memoire-des-luttes/pack", version: 1, id: "p", nom: "Pack", series: [], cartes });
const delegation = (x = {}) => deleguer({ type: "delegation", collectif: "cgt-dz", nom: "CGT Douarnenez", clePublique: local.publique, droits: ["base", "rare"], emise: "2027-01-01", expire: "2027-12-31", ...x }, racine.secrete);

describe("signatures", () => {
  it("vérifie une donnée signée, quel que soit l'ordre des champs", () => {
    const s = signer({ a: 1, b: [2, "x"] }, racine.secrete);
    expect(verifier({ b: [2, "x"], a: 1 }, s, racine.publique)).toBe(true);
  });
  it("refuse une donnée modifiée ou une autre clé", () => {
    const s = signer({ a: 1 }, racine.secrete);
    expect(verifier({ a: 2 }, s, racine.publique)).toBe(false);
    expect(verifier({ a: 1 }, s, local.publique)).toBe(false);
    expect(verifier({ a: 1 }, "pas-une-signature", racine.publique)).toBe(false);
  });
  it("retrouve la clé publique et donne une empreinte lisible", () => {
    expect(clePublique(racine.secrete)).toBe(racine.publique);
    expect(empreinte(racine.publique)).toMatch(/^[0-9a-f]{4}( [0-9a-f]{4}){3}$/);
  });
});

describe("packs", () => {
  it("non signé", () => {
    expect(verifierPack(pack(), conf()).confiance).toBe("non-signe");
  });
  it("officiel quand la racine signe", () => {
    expect(verifierPack(signerPack(pack(), racine.secrete), conf()).confiance).toBe("officiel");
  });
  it("refusé si une seule lettre change après signature", () => {
    const p = signerPack(pack(), racine.secrete);
    p.cartes[0] = { ...p.cartes[0], title: "Carte A" };
    const r = verifierPack(p, conf());
    expect(r.confiance).toBe("invalide");
  });
  it("refusé si signé par une clé inconnue sans délégation", () => {
    expect(verifierPack(signerPack(pack(), local.secrete), conf()).confiance).toBe("invalide");
  });
  it("local quand un collectif délégué signe", () => {
    const r = verifierPack(signerPack(pack(), local.secrete, delegation()), conf());
    expect(r.confiance).toBe("local");
    if (r.confiance === "local") expect(r.collectif.nom).toBe("CGT Douarnenez");
  });
  it("refusé si le collectif dépasse ses droits", () => {
    const r = verifierPack(signerPack(pack([carte("a", "legendaire")]), local.secrete, delegation()), conf());
    expect(r).toMatchObject({ confiance: "invalide" });
  });
  it("refusé si la délégation a expiré ou a été révoquée", () => {
    const p = signerPack(pack(), local.secrete, delegation({ expire: "2027-01-31" }));
    expect(verifierPack(p, conf()).confiance).toBe("invalide");
    const q = signerPack(pack(), local.secrete, delegation());
    expect(verifierPack(q, conf({ revoquees: [local.publique] })).confiance).toBe("invalide");
  });
  it("refusé si quelqu'un modifie les droits de sa délégation", () => {
    const d = { ...delegation(), droits: ["base", "rare", "legendaire"] as Carte["rar"][] };
    expect(verifierDelegation(d as never, conf()).ok).toBe(false);
  });
});
