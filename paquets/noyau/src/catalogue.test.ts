import { describe, expect, it } from "vitest";
import { join } from "node:path";
import { assembler } from "../../../scripts/assembler.mjs";
import { preparerCatalogue } from "./catalogue";

describe("preparerCatalogue avec les vraies données de data/", () => {
  const cat = preparerCatalogue(assembler(join(import.meta.dirname, "../../..")));

  it("trouve toutes les cartes de chaque série", () => {
    const total = cat.series.reduce((n, s) => n + s.cartes.length, 0);
    expect(cat.officielles).toHaveLength(total);
  });

  it("indique la série de chaque carte", () => {
    for (const c of cat.officielles) expect(cat.series.some(s => s.id === c.serie)).toBe(true);
  });

  it("charge les familles", () => {
    expect(Object.keys(cat.familles)).toContain("personnalite");
  });
});
