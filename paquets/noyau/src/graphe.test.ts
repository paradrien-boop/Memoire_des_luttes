import { describe, expect, it } from "vitest";
import { join } from "node:path";
import { assembler } from "../../../scripts/assembler.mjs";
import { preparerCatalogue } from "./catalogue";
import { disposer, ecarterEtiquettes, liensUniques } from "./graphe";

const cartes = preparerCatalogue(assembler(join(import.meta.dirname, "../../.."))).officielles;

describe("carte des idées", () => {
  it("compte chaque lien une seule fois", () => {
    expect(liensUniques([{ id: "a", links: ["b"] }, { id: "b", links: ["a", "c"] }])).toEqual([{ a: "a", b: "b" }, { a: "b", b: "c" }]);
  });

  it("place toutes les cartes dans le cadre, sans superposition, toujours au même endroit", () => {
    const ids = cartes.map((c) => c.id);
    const n = disposer(ids, liensUniques(cartes), 600, 420);
    expect(n).toHaveLength(ids.length);
    for (const p of n) {
      expect(p.x).toBeGreaterThanOrEqual(30); expect(p.x).toBeLessThanOrEqual(570);
      expect(p.y).toBeGreaterThanOrEqual(30); expect(p.y).toBeLessThanOrEqual(390);
    }
    for (let i = 0; i < n.length; i++) for (let j = i + 1; j < n.length; j++) expect(Math.hypot(n[i].x - n[j].x, n[i].y - n[j].y)).toBeGreaterThan(20);
    expect(disposer(ids, liensUniques(cartes), 600, 420)).toEqual(n);
  });

  it("rapproche les cartes liées", () => {
    const ids = cartes.map((c) => c.id);
    const n = Object.fromEntries(disposer(ids, liensUniques(cartes), 600, 420).map((p) => [p.id, p]));
    const dist = (a: string, b: string) => Math.hypot(n[a].x - n[b].x, n[a].y - n[b].y);
    const liees = liensUniques(cartes).map((l) => dist(l.a, l.b));
    const moyenneLiees = liees.reduce((s, x) => s + x, 0) / liees.length;
    let total = 0, nb = 0;
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) { total += dist(ids[i], ids[j]); nb++; }
    expect(moyenneLiees).toBeLessThan(total / nb);
  });
});

describe("étiquettes de la carte des idées", () => {
  it("ne se chevauchent pas, même avec toutes les cartes et des « ? », et restent dans le cadre", () => {
    const ids = [...cartes.map((c) => c.id), "x1", "x2", "x3", "x4"];
    // Mêmes réglages que l'app (CarteDesIdees.svelte).
    const H = Math.ceil(ids.length / 3) * 76 + 80;
    const n = ecarterEtiquettes(disposer(ids, liensUniques(cartes), 444, H - 12, 34, 400, 1.2).map((q) => ({ ...q, x: q.x + 78 })), { l: 150, h: 66 }, 600, H, { x: 78, y: 34 });
    for (const q of n) { expect(q.x).toBeGreaterThanOrEqual(78); expect(q.x).toBeLessThanOrEqual(522); expect(q.y).toBeGreaterThanOrEqual(34); expect(q.y).toBeLessThanOrEqual(H - 34); }
    for (let i = 0; i < n.length; i++) for (let j = i + 1; j < n.length; j++) {
      const ox = 150 - Math.abs(n[i].x - n[j].x), oy = 66 - Math.abs(n[i].y - n[j].y);
      expect(ox > 0.01 && oy > 0.01, `${n[i].id} et ${n[j].id} se chevauchent`).toBe(false);
    }
  });
});
