import { describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { lireDessins, nomsPossibles, TAILLE_MAX } from "./dessins.mjs";

function depot(fichiers: Record<string, string | Buffer>) {
  const racine = mkdtempSync(join(tmpdir(), "mdl-dessins-"));
  for (const [chemin, contenu] of Object.entries(fichiers)) {
    const f = join(racine, "data/dessins", chemin);
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, contenu);
  }
  return racine;
}
const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -170 120 180"><circle r="5"/></svg>';

describe("dessins déposés", () => {
  it("connaît tous les noms possibles", () => {
    const n = nomsPossibles();
    expect(n).toContain("personnage/objets/bonnet-phrygien");
    expect(n).toContain("ennemis/censeur-fuite");
    expect(n).toContain("chat/stade-4-endormi");
    expect(n).toContain("quartier/livre-3");
    expect(n).toContain("personnage/base-2-victoire");
  });

  it("lit les SVG et les PNG bien nommés, ignore gabarits, modèles et README", () => {
    const { dessins, problemes } = lireDessins(depot({
      "ennemis/censeur.svg": svg,
      "chat/stade-0.png": Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      "gabarits/personnage.svg": svg,
      "modeles/ennemis/censeur.svg": svg,
      "README.md": "x",
    }));
    expect(Object.keys(dessins).sort()).toEqual(["chat/stade-0", "ennemis/censeur"]);
    expect(dessins["chat/stade-0"].type).toBe("png");
    expect(problemes).toEqual([]);
  });

  it("refuse les noms inconnus, les mauvais formats, les fichiers trop lourds", () => {
    const { dessins, problemes } = lireDessins(depot({
      "ennemis/policier.svg": svg,
      "chat/stade-1.jpg": "x",
      "chat/stade-2.svg": "<svg>" + "x".repeat(TAILLE_MAX) + "</svg>",
    }));
    expect(dessins).toEqual({});
    expect(problemes.join("\n")).toMatch(/policier.svg : nom inconnu/);
    expect(problemes.join("\n")).toMatch(/stade-1.jpg : format non pris en charge/);
    expect(problemes.join("\n")).toMatch(/stade-2.svg : trop lourd/);
  });

  it("refuse les SVG avec du script ou des liens vers l'extérieur", () => {
    const { dessins, problemes } = lireDessins(depot({
      "ennemis/soldat.svg": '<svg><script>alert(1)</script></svg>',
      "ennemis/patron.svg": '<svg><circle onclick="x()"/></svg>',
      "ennemis/mouchard.svg": '<svg><image href="https://exemple.org/x.png"/></svg>',
      "ennemis/general.svg": '<svg><image href="data:image/png;base64,AAAA"/></svg>',
    }));
    expect(Object.keys(dessins)).toEqual(["ennemis/general"]);
    expect(problemes).toHaveLength(3);
  });
});

import { nomDepuisFichier } from "./dessins-noms.mjs";
describe("retrouver le nom d'un dessin depuis un fichier", () => {
  it("par le chemin ou par le seul nom de fichier", () => {
    expect(nomDepuisFichier("mon-travail/dessins/ennemis/censeur.svg")).toBe("ennemis/censeur");
    expect(nomDepuisFichier("censeur.svg")).toBe("ennemis/censeur");
    expect(nomDepuisFichier("bonnet-phrygien.PNG")).toBe("personnage/objets/bonnet-phrygien");
    expect(nomDepuisFichier("livre.svg")).toBe("personnage/objets/livre");
    expect(nomDepuisFichier("livre-3.svg")).toBe("quartier/livre-3");
    expect(nomDepuisFichier("stade-2-endormi.svg")).toBe("chat/stade-2-endormi");
    expect(nomDepuisFichier("croquis.svg")).toBeNull();
  });
});
