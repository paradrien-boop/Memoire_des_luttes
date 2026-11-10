import { describe, expect, it } from "vitest";
import { cleUnique, encoderQr, lireQr, verifierQr, type QrStand, type QrEvenement } from "./qr";
import { deleguer, genererCles, type Confiance } from "./signature";

const racine = genererCles();
const local = genererCles();
const conf: Confiance = { racines: [racine.publique], revoquees: [], date: "2027-03-18" };
const stand: QrStand = { t: "S", i: "stand-1", m: "rare", du: "2027-03-18", au: "2027-03-18" };
const ev: QrEvenement = { t: "E", e: "ev-18mars2027", n: 137, du: "2027-03-18", au: "2027-03-19" };
const delegation = deleguer({ type: "delegation", collectif: "cgt-dz", nom: "CGT Douarnenez", clePublique: local.publique, droits: ["base", "rare"], emise: "2027-01-01", expire: "2027-12-31" }, racine.secrete);

describe("lire et écrire un QR", () => {
  it("retrouve le contenu et la signature", () => {
    const lu = lireQr(encoderQr(stand, racine.secrete))!;
    expect(lu.contenu).toEqual(stand);
    expect(lu.signature).toMatch(/^[0-9a-f]{128}$/);
  });
  it("garde les accents d'une carte perso", () => {
    const lu = lireQr(encoderQr({ t: "P", x: "abc", carte: { fam: "chant", rar: "base", title: "Le Temps des cerises — été" } }))!;
    expect(lu.contenu).toMatchObject({ carte: { title: "Le Temps des cerises — été" } });
  });
  it("ignore ce qui n'est pas un QR de l'app", () => {
    expect(lireQr("https://exemple.org")).toBeNull();
    expect(lireQr("MDL1:S:!!!")).toBeNull();
  });
  it("reste assez court pour un QR facile à scanner", () => {
    expect(encoderQr(ev, racine.secrete).length).toBeLessThan(250);
  });
});

describe("vérifier un QR signé", () => {
  it("accepte un QR de stand ou d'événement signé par la racine", () => {
    expect(verifierQr(lireQr(encoderQr(stand, racine.secrete))!, conf, [])).toMatchObject({ ok: true });
    expect(verifierQr(lireQr(encoderQr(ev, racine.secrete))!, conf, [])).toMatchObject({ ok: true });
  });
  it("refuse un QR non signé, modifié, ou hors de ses dates", () => {
    expect(verifierQr(lireQr(encoderQr(stand))!, conf, []).ok).toBe(false);
    const lu = lireQr(encoderQr(stand, racine.secrete))!;
    expect(verifierQr({ ...lu, contenu: { ...stand, m: "legendaire" } }, conf, []).ok).toBe(false);
    expect(verifierQr(lu, { ...conf, date: "2027-03-19" }, []).ok).toBe(false);
    expect(verifierQr(lu, { ...conf, date: "2027-03-17" }, []).ok).toBe(false);
  });
  it("accepte un collectif local de confiance, dans la limite de ses droits", () => {
    const s: QrStand = { ...stand, c: "cgt-dz" };
    expect(verifierQr(lireQr(encoderQr(s, local.secrete))!, conf, [delegation])).toEqual({ ok: true, emetteur: "CGT Douarnenez" });
    expect(verifierQr(lireQr(encoderQr(s, local.secrete))!, conf, []).ok).toBe(false);
    const trop: QrStand = { ...s, m: "legendaire" };
    expect(verifierQr(lireQr(encoderQr(trop, local.secrete))!, conf, [delegation]).ok).toBe(false);
  });
  it("interdit aux collectifs locaux les cartes d'événement", () => {
    expect(verifierQr(lireQr(encoderQr(ev, local.secrete))!, conf, [delegation]).ok).toBe(false);
  });
  it("une carte d'événement par événement, quel que soit le numéro", () => {
    expect(cleUnique(ev)).toBe(cleUnique({ ...ev, n: 2 }));
    expect(cleUnique(stand)).not.toBe(cleUnique({ ...stand, i: "stand-2" }));
  });
});
